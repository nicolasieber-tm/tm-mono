import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin } from "lucide-react";

interface AddressAutocompleteProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    county?: string;
    postcode?: string;
  };
}

// Helper function to format address intelligently
function formatAddressShort(suggestion: AddressSuggestion): string {
  if (!suggestion.address) {
    return suggestion.display_name;
  }

  const { road, house_number, city, town, village, municipality, state, county } = suggestion.address;

  // Get the locality (city, town, or village)
  const locality = city || town || village || municipality;

  // Get the region (state/canton or county)
  const region = state || county;

  // If there's a street with house number, show: "Street Number, City, Canton"
  if (road && house_number && locality && region) {
    return `${road} ${house_number}, ${locality}, ${region}`;
  }

  // If there's a street without house number, show: "Street, City, Canton"
  if (road && locality && region) {
    return `${road}, ${locality}, ${region}`;
  }

  // Otherwise just show: "City, Canton"
  if (locality && region) {
    return `${locality}, ${region}`;
  } else if (locality) {
    return locality;
  } else if (region) {
    return region;
  }

  // Fallback to full address
  return suggestion.display_name;
}

export function AddressAutocomplete({ id, value, onChange, placeholder }: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search
  useEffect(() => {
    if (!value || value.length < 3) {
      setSuggestions([]);
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=ch&limit=5&addressdetails=1`;

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Blickwinkel-Teamtool (contact: your-email@example.com)'
          }
        });

        const data = await response.json();
        setSuggestions(data);
        setIsOpen(data.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  const handleSelect = (suggestion: AddressSuggestion) => {
    // Use the formatted short version for storage
    const formattedAddress = formatAddressShort(suggestion);
    onChange(formattedAddress);
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)]"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            {suggestions.length === 0 ? (
              <CommandEmpty>Keine Adressen gefunden</CommandEmpty>
            ) : (
              <CommandGroup>
                {suggestions.map((suggestion, index) => (
                  <CommandItem
                    key={index}
                    value={suggestion.display_name}
                    onSelect={() => handleSelect(suggestion)}
                    className="cursor-pointer"
                  >
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatAddressShort(suggestion)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
