'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface DebateResult {
  id: string;
  title: string;
  description: string;
  category: string;
  totalVotes: number;
  score: number;
  averageScore: number;
  votes?: Array<{
    rank: number;
    user: { name: string };
  }>;
}

interface ResultsData {
  results: DebateResult[];
  top4: DebateResult[];
  totalVoters: number;
}

export default function DebateResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
    // Cargar resultados independientemente del rol para debug
    if (status === 'authenticated') {
      fetchResults();
    }
  }, [status]);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/debates/results?detailed=true');
      if (!response.ok) throw new Error('Failed to fetch results');
      const data = await response.json();
      console.log('Resultados recibidos:', data); // Debug
      setResults(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching results:', err);
      setLoading(false);
    }
  };

  const resetVotes = async () => {
    if (!confirm('¿Estás seguro de que quieres resetear todos los votos?')) {
      return;
    }

    try {
      const response = await fetch('/api/debates/seed', {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to reset votes');

      alert('Votos reseteados correctamente');
      fetchResults();
    } catch (err) {
      console.error('Error resetting votes:', err);
      alert('Error al resetear votos');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No hay resultados disponibles</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📊 Resultados de la Votación
              </h1>
              <p className="text-gray-600">
                Total de votantes: <span className="font-bold text-blue-600">{results.totalVoters}</span>
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
              </button>
              <button
                onClick={resetVotes}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Resetear votos
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-blue-900 mb-4">
              🏆 Los 4 Temas Seleccionados
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {results.top4.map((topic, index) => (
                <div key={topic.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                      </span>
                      <h3 className="font-bold text-lg">{topic.title}</h3>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {topic.score} pts
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{topic.description}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{topic.category}</span>
                    <span>{topic.totalVotes} votos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Clasificación Completa
          </h3>
          <div className="space-y-3">
            {results.results.map((topic, index) => (
              <div
                key={topic.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  index < 4
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl font-bold text-gray-400">
                        #{index + 1}
                      </span>
                      <h4 className="font-bold text-lg">{topic.title}</h4>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-800">
                        {topic.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm ml-8">{topic.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-3xl font-bold text-blue-600">{topic.score}</div>
                    <div className="text-sm text-gray-500">puntos</div>
                    <div className="text-sm text-gray-500">{topic.totalVotes} votos</div>
                  </div>
                </div>

                {showDetails && topic.votes && topic.votes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 ml-8">
                    <h5 className="font-semibold text-sm text-gray-700 mb-2">
                      Distribución de votos:
                    </h5>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map(rank => {
                        const votesForRank = topic.votes.filter(v => v.rank === rank);
                        return (
                          <div key={rank} className="bg-gray-100 p-2 rounded text-center">
                            <div className="text-lg font-bold text-gray-900">
                              #{rank}
                            </div>
                            <div className="text-sm text-gray-600">
                              {votesForRank.length} votos
                            </div>
                            {votesForRank.length > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                {votesForRank.map(v => v.user.name).join(', ')}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
