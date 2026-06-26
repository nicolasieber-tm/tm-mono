import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Settings, Plus, Pencil, Trash2 } from "lucide-react";
import {
  useTimeEntryCategories,
  useCreateTimeEntryCategory,
  useUpdateTimeEntryCategory,
  useDeleteTimeEntryCategory,
} from "@/hooks/useTimeEntryCategories";

export const CategoryManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<{ id: string; name: string } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");

  const { data: categories, isLoading } = useTimeEntryCategories();
  const createMutation = useCreateTimeEntryCategory();
  const updateMutation = useUpdateTimeEntryCategory();
  const deleteMutation = useDeleteTimeEntryCategory();

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      createMutation.mutate(
        { name: newCategoryName.trim() },
        {
          onSuccess: () => {
            setNewCategoryName("");
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
          updates: { name: editCategoryName.trim() },
        },
        {
          onSuccess: () => {
            setEditCategory(null);
            setEditCategoryName("");
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

  const openEditDialog = (category: { id: string; name: string }) => {
    setEditCategory(category);
    setEditCategoryName(category.name);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Kategorien verwalten
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Kategorien verwalten</DialogTitle>
            <DialogDescription>
              Verwalten Sie die verfügbaren Kategorien für Zeiteinträge.
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
                        disabled={updateMutation.isPending}
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
              Geben Sie den Namen für die neue Kategorie ein.
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setNewCategoryName("");
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
              Ändern Sie den Namen der Kategorie.
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditCategory(null);
                setEditCategoryName("");
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
