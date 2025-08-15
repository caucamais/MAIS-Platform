import React from 'react';
import { useApp } from '../../contexts/appContextUtils';
import ComiteEjecutivoNacional from './ComiteEjecutivoNacional';
import LiderRegional from './LiderRegional';
import ComiteDepartamental from './ComiteDepartamental';
import Candidato from './Candidato';
import MessageCenter from '../../messages/components/MessageCenter';
import LoadingSpinner from '../../ui/components/LoadingSpinner';

const DashboardSelector: React.FC = () => {
  const { user, loading } = useApp();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // This should ideally not be reached if ProtectedRoute is working,
    // but it's a good fallback.
    return null;
  }

  switch (user.role) {
    case 'comite_ejecutivo_nacional':
      return <ComiteEjecutivoNacional user={user} />;
    case 'lider_regional':
      return <LiderRegional user={user} />;
    case 'comite_departamental':
      return <ComiteDepartamental user={user} />;
    case 'candidato':
      return <Candidato user={user} />;
    case 'influenciador_digital':
      return <MessageCenter />;
    case 'lider_comunitario':
      return <MessageCenter />;
    case 'votante_simpatizante':
      return <MessageCenter />;
    default:
      // A sensible default dashboard or a message
      return <div className="text-center p-8">Seleccione una opción del menú para comenzar.</div>;
  }
};

export default DashboardSelector;
