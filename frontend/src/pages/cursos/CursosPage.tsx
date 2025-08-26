
import { AcademicCapIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function CursosPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestió de Cursos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Administra els cursos acadèmics dels centres.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nou Curs
          </Button>
        </div>
      </div>

      {/* Content Placeholder */}
      <Card className="p-12">
        <div className="text-center">
          <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Gestió de Cursos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aquí podràs gestionar els cursos acadèmics, crear nous cursos i administrar les assignatures.
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
