
import { UsersIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function UsuarisPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestió d'Usuaris</h1>
          <p className="mt-2 text-sm text-gray-700">
            Administra els usuaris del sistema i els seus permisos.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nou Usuari
          </Button>
        </div>
      </div>

      {/* Content Placeholder */}
      <Card className="p-12">
        <div className="text-center">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Gestió d'Usuaris</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aquí podràs gestionar els usuaris del sistema, crear nous usuaris i administrar els seus rols i permisos.
          </p>
          <div className="mt-6">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Començar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
