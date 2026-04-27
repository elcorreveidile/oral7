'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface DebateTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  order: number;
  _count: { votes: number };
}

interface Vote {
  topicId: string;
  rank: number;
}

export default function VotacionDebatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [topics, setTopics] = useState<DebateTopic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchTopics();
      checkIfVoted();
    }
  }, [status, router]);

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/debates/topics');
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data);
    } catch (err) {
      setError('Error al cargar los temas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfVoted = async () => {
    try {
      const response = await fetch('/api/debates/vote');
      if (response.ok) {
        const votes = await response.json();
        if (votes && votes.length > 0) {
          setHasVoted(true);
          setSelectedTopics(votes.map((v: any) => ({
            topicId: v.topicId,
            rank: v.rank
          })));
        }
      }
    } catch (err) {
      console.error('Error checking vote status:', err);
    }
  };

  const handleTopicClick = (topicId: string) => {
    if (hasVoted) return;

    setError('');

    // Check if already selected
    const existingIndex = selectedTopics.findIndex(t => t.topicId === topicId);

    if (existingIndex !== -1) {
      // Remove from selection
      setSelectedTopics(prev => {
        const newSelection = prev.filter(t => t.topicId !== topicId);
        // Reassign ranks
        return newSelection.map((t, i) => ({ ...t, rank: i + 1 }));
      });
    } else if (selectedTopics.length < 4) {
      // Add to selection
      setSelectedTopics(prev => [
        ...prev,
        { topicId, rank: prev.length + 1 }
      ]);
    }
  };

  const handleSubmit = async () => {
    if (selectedTopics.length !== 4) {
      setError('Debes seleccionar exactamente 4 temas');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/debates/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votes: selectedTopics })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al enviar voto');
      }

      setSuccess(true);
      setHasVoted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getRankBadge = (topicId: string) => {
    const topic = selectedTopics.find(t => t.topicId === topicId);
    if (!topic) return null;

    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    return (
      <span className={`ml-2 px-2 py-1 rounded-full text-white text-sm font-bold ${colors[topic.rank - 1]}`}>
        #{topic.rank}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando temas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🗳️ Votación: Temas de Debate
          </h1>
          <p className="text-lg text-gray-600">
            Elige los 4 temas que más te interesen para la tertulia del Local Cultural de Granada
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Ordena tus preferencias: #1 = más importante, #4 = menos importante
          </p>
        </div>

        {hasVoted && !success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-green-800 font-semibold">
              ✓ Ya has votado. Aquí están tus selecciones:
            </p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              ¡Voto registrado correctamente!
            </h2>
            <p className="text-green-700">
              Tus preferencias han sido guardadas. Los 4 temas más votados se anunciarán pronto.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-md">
            <span className="text-gray-700 font-semibold">
              Temas seleccionados:
            </span>
            <span className="text-2xl font-bold text-blue-600">
              {selectedTopics.length}/4
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => {
            const isSelected = selectedTopics.some(t => t.topicId === topic.id);
            const isDisabled = hasVoted || selectedTopics.length >= 4 && !isSelected;

            return (
              <div
                key={topic.id}
                onClick={() => !isDisabled && handleTopicClick(topic.id)}
                className={`
                  relative p-6 rounded-lg border-2 cursor-pointer transition-all
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }
                  ${isDisabled && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                    {topic.category}
                  </span>
                  {getRankBadge(topic.id)}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {topic.title}
                </h3>

                <p className="text-gray-600 text-sm mb-3">
                  {topic.description}
                </p>

                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <span className="text-2xl">✓</span>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    {topic._count.votes} votos totales
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {!hasVoted && selectedTopics.length === 4 && (
          <div className="mt-8 text-center">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {submitting ? 'Enviando voto...' : '🗳️ Enviar Mi Voto'}
            </button>
          </div>
        )}

        <div className="mt-12 text-center">
          <a
            href="/resultados-debates"
            className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            Ver resultados en tiempo real
          </a>
        </div>
      </div>
    </div>
  );
}
