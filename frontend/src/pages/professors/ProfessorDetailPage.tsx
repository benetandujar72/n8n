import React from 'react';
import { useParams } from 'react-router-dom';

const ProfessorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Detall del Professor</h1>
      <p className="text-gray-600">Detall del professor amb ID: {id} (en construcció).</p>
    </div>
  );
};

export default ProfessorDetailPage;
