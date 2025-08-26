
import { CogIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function IntegracionsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestió d'Integracions</h1>
          <p className="mt-2 text-sm text-gray-700">
            Administra les integracions amb sistemes externs.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nova Integració
          </Button>
        </div>
      </div>

      {/* Content Placeholder */}
      <Card className="p-12">
        <div className="text-center">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Gestió d'Integracions</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aquí podràs gestionar les integracions amb Moodle, Google Classroom, Google Drive i altres sistemes.
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
