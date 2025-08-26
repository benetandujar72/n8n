import React from 'react';
import { useParams } from 'react-router-dom';

const AlumneDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Detall de l'Alumne</h1>
      <p className="text-gray-600">Detall de l'alumne amb ID: {id} (en construcció).</p>
    </div>
  );
};

export default AlumneDetailPage;
