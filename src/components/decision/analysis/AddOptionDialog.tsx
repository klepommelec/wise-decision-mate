
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface AddOptionDialogProps {
  onAddOption: (option: { title: string }) => void;
}

export function AddOptionDialog({ onAddOption }: AddOptionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newOptionTitle, setNewOptionTitle] = useState('');

  const handleAddOption = () => {
    if (newOptionTitle.trim()) {
      onAddOption({ title: newOptionTitle.trim() });
      setNewOptionTitle('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Ajouter une option
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle option</DialogTitle>
          <DialogDescription>
            Saisissez un titre pour votre nouvelle option. Une description sera générée automatiquement.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Titre de l'option (ex: Acheter une maison neuve)"
            value={newOptionTitle}
            onChange={(e) => setNewOptionTitle(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleAddOption}>Ajouter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
