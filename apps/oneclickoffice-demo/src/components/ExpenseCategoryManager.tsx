import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Settings, Plus, Pencil, Trash2, Tags } from "lucide-react";
import {
  useExpenseCategories,
  useCreateExpenseCategory,
  useDeleteExpenseCategory,
  useUpdateExpenseCategory,
} from "@/hooks/useExpenseCategories";

export const ExpenseCategoryManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<{
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#64748b");
  const [editCategoryIcon, setEditCategoryIcon] = useState("");
  const [editCategoryColor, setEditCategoryColor] = useState("#64748b");

  const { data: categories, isLoading } = useExpenseCategories();
  const createMutation = useCreateExpenseCategory();
  const deleteMutation = useDeleteExpenseCategory();
  const updateMutation = useUpdateExpenseCategory();

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      createMutation.mutate(
        {
          name: newCategoryName.trim(),
          icon: newCategoryIcon.trim() || null,
          color: newCategoryColor || null,
        },
        {
          onSuccess: () => {
            setNewCategoryName("");
            setNewCategoryIcon("");
            setNewCategoryColor("#64748b");
            setIsAddDialogOpen(false);
          },
        }
      );
    }
  };

  const handleEditCategory = () => {
    if (editCategory && editCategoryName.trim()) {
      updateMutation.mutate(
        {
          id: editCategory.id,
          name: editCategoryName.trim(),
          icon: editCategoryIcon.trim() || null,
          color: editCategoryColor || null,
        },
        {
          onSuccess: () => {
            setEditCategory(null);
            setEditCategoryName("");
            setEditCategoryIcon("");
            setEditCategoryColor("#64748b");
            setIsEditDialogOpen(false);
          },
        }
      );
    }
  };

  const handleDeleteCategory = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => {
          setDeleteId(null);
        },
      });
    }
  };

  const openEditDialog = (category: {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
  }) => {
    setEditCategory({
      id: category.id,
      name: category.name,
      icon: category.icon ?? null,
      color: category.color ?? null,
    });
    setEditCategoryName(category.name);
    setEditCategoryIcon(category.icon ?? "");
    setEditCategoryColor(category.color ?? "#64748b");
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Tags className="h-4 w-4 mr-2" />
            Spesen-Kategorien verwalten
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Spesen-Kategorien verwalten</DialogTitle>
            <DialogDescription>
              Verwalten Sie die verfügbaren Kategorien für Spesen.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => setIsAddDialogOpen(true)}
                disabled={createMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Neue Kategorie
              </Button>
            </div>

            <div className="space-y-2">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Laden...
                </p>
              ) : categories && categories.length > 0 ? (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <span className="font-medium">{category.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(category.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine Kategorien vorhanden
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Kategorie erstellen</DialogTitle>
            <DialogDescription>
              Geben Sie den Namen für die neue Spesen-Kategorie ein.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Kategoriename"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddCategory();
                }
              }}
            />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-cat-icon">Icon (Emoji)</Label>
                <Input
                  id="new-cat-icon"
                  value={newCategoryIcon}
                  onChange={(e) => setNewCategoryIcon(e.target.value)}
                  placeholder="z.B. ✈️ 🍽️ 🔧"
                  maxLength={4}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-cat-color">Farbe</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="new-cat-color"
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="h-10 w-14 rounded-md border border-input cursor-pointer"
                  />
                  <Input
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    placeholder="#64748b"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-muted">
              <div
                className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[22px] shadow-md shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${newCategoryColor} 0%, ${newCategoryColor}dd 100%)`,
                  boxShadow: `0 2px 8px ${newCategoryColor}40`,
                }}
              >
                {newCategoryIcon || "📁"}
              </div>
              <div className="text-sm text-muted-foreground">
                Vorschau in der Spesen-Ordneransicht
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setNewCategoryName("");
                setNewCategoryIcon("");
                setNewCategoryColor("#64748b");
              }}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim() || createMutation.isPending}
            >
              Erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategorie bearbeiten</DialogTitle>
            <DialogDescription>
              Ändern Sie den Namen der Spesen-Kategorie.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Kategoriename"
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEditCategory();
                }
              }}
            />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-cat-icon">Icon (Emoji)</Label>
                <Input
                  id="edit-cat-icon"
                  value={editCategoryIcon}
                  onChange={(e) => setEditCategoryIcon(e.target.value)}
                  placeholder="z.B. ✈️ 🍽️ 🔧"
                  maxLength={4}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-cat-color">Farbe</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="edit-cat-color"
                    type="color"
                    value={editCategoryColor}
                    onChange={(e) => setEditCategoryColor(e.target.value)}
                    className="h-10 w-14 rounded-md border border-input cursor-pointer"
                  />
                  <Input
                    value={editCategoryColor}
                    onChange={(e) => setEditCategoryColor(e.target.value)}
                    placeholder="#64748b"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-muted">
              <div
                className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[22px] shadow-md shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${editCategoryColor} 0%, ${editCategoryColor}dd 100%)`,
                  boxShadow: `0 2px 8px ${editCategoryColor}40`,
                }}
              >
                {editCategoryIcon || "📁"}
              </div>
              <div className="text-sm text-muted-foreground">
                Vorschau in der Spesen-Ordneransicht
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditCategory(null);
                setEditCategoryName("");
                setEditCategoryIcon("");
                setEditCategoryColor("#64748b");
              }}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleEditCategory}
              disabled={!editCategoryName.trim() || updateMutation.isPending}
            >
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategorie löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diese Kategorie löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
