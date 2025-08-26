import React from 'react';
import { useParams } from 'react-router-dom';

const AssignaturaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Detall de l'Assignatura</h1>
      <p className="text-gray-600">Detall de l'assignatura amb ID: {id} (en construcció).</p>
    </div>
  );
};

export default AssignaturaDetailPage;
