import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Biome, Resource, Equipment } from "@shared/schema";

interface ExpeditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  biome: Biome | null;
  resources: Resource[];
  equipment: Equipment[];
  playerId: string;
  onStartExpedition: (selectedResources: string[], equipment: string[]) => void;
}

type ExpeditionStep = "resource-selection" | "equipment-selection" | "expedition-progress";

export default function ExpeditionModal({ 
  isOpen, 
  onClose, 
  biome, 
  resources, 
  equipment, 
  playerId,
  onStartExpedition
}: ExpeditionModalProps) {
  const [currentStep, setCurrentStep] = useState<ExpeditionStep>("resource-selection");
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const { toast } = useToast();

  const handleClose = () => {
    setCurrentStep("resource-selection");
    setSelectedResources([]);
    setSelectedEquipment([]);
    onClose();
  };

  const getBiomeResources = () => {
    if (!biome) return [];
    const resourceIds = biome.availableResources as string[];
    return resourceIds.map(id => resources.find(r => r.id === id)).filter(Boolean) as Resource[];
  };

  const toggleResourceSelection = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const toggleEquipmentSelection = (equipmentId: string) => {
    setSelectedEquipment(prev => 
      prev.includes(equipmentId) 
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  if (!biome) return null;

  const biomeResources = getBiomeResources();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Expedição na {biome.name}</DialogTitle>
        <DialogDescription className="sr-only">Prepare-se para a coleta de recursos no bioma {biome.name}</DialogDescription>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-forest to-adventure-600 text-white p-6 rounded-t-xl -m-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{biome.emoji}</span>
              <div>
                <h3 className="text-xl font-bold">Expedição na {biome.name}</h3>
                <p className="text-adventure-100">Prepare-se para a coleta de recursos</p>
              </div>
            </div>
            <button onClick={handleClose} className="text-white hover:text-adventure-200 transition-colors">
              <span className="text-2xl">✕</span>
            </button>
          </div>
        </div>

        {/* Resource Selection Step */}
        {currentStep === "resource-selection" && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-800">🎯 Escolha os recursos que deseja coletar:</h4>
            <div className="grid grid-cols-2 gap-4">
              {biomeResources.map((resource) => (
                <label
                  key={resource.id}
                  className={`resource-option flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedResources.includes(resource.id)
                      ? "border-forest bg-green-50"
                      : "border-gray-200 hover:border-forest hover:bg-green-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedResources.includes(resource.id)}
                    onChange={() => toggleResourceSelection(resource.id)}
                    className="w-4 h-4 text-forest border-gray-300 rounded focus:ring-forest"
                  />
                  <span className="text-2xl">{resource.emoji}</span>
                  <div>
                    <div className="font-semibold text-gray-800">{resource.name}</div>
                    <div className="text-sm text-gray-600">
                      {resource.type === "basic" ? "Recurso básico" : "Recurso único"}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep("equipment-selection")}
                disabled={selectedResources.length === 0}
                className="bg-forest hover:bg-adventure-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Próximo: Equipamentos ➡️
              </button>
            </div>
          </div>
        )}

        {/* Equipment Selection Step */}
        {currentStep === "equipment-selection" && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-800">🎒 Escolha seus equipamentos:</h4>
            <div className="grid grid-cols-3 gap-4">
              {equipment.map((equip) => (
                <label
                  key={equip.id}
                  className={`equipment-option flex flex-col items-center space-y-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedEquipment.includes(equip.id)
                      ? "border-forest bg-green-50"
                      : "border-gray-200 hover:border-forest hover:bg-green-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEquipment.includes(equip.id)}
                    onChange={() => toggleEquipmentSelection(equip.id)}
                    className="w-4 h-4 text-forest border-gray-300 rounded focus:ring-forest"
                  />
                  <span className="text-3xl">{equip.emoji}</span>
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">{equip.name}</div>
                    <div className="text-xs text-gray-600">{equip.effect}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep("resource-selection")}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                ⬅️ Voltar: Recursos
              </button>
              <button
                onClick={() => onStartExpedition(selectedResources, selectedEquipment)}
                className="bg-forest hover:bg-adventure-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                🚀 Iniciar Expedição
              </button>
            </div>
          </div>
        )}


      </DialogContent>
    </Dialog>
  );
}