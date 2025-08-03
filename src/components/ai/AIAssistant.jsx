// components/ai/AIAssistant.jsx
import React, { useState, useEffect } from 'react';
import { Brain, X, Send, Lightbulb, BarChart3, MessageSquare, Download } from 'lucide-react';
import QuerySuggestions from './QuerySuggestions';
import ResponseFormatter from './ResponseFormatter';
import DataAnalyzer from './DataAnalyzer';

const AIAssistant = ({ data, stats, onClose }) => {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  const dataAnalyzer = new DataAnalyzer(data, stats);

  const handleSendQuery = async () => {
    if (!query.trim() || isLoading) return;

    const userMessage = { type: 'user', content: query, timestamp: new Date() };
    setConversation(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Analizza la query e genera la risposta
      const response = await dataAnalyzer.processQuery(query);
      
      const aiMessage = { 
        type: 'ai', 
        content: response, 
        timestamp: new Date(),
        exportable: response.exportable || false
      };
      
      setConversation(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { 
        type: 'ai', 
        content: { 
          type: 'error', 
          title: 'Errore nell\'analisi', 
          message: 'Si è verificato un errore durante l\'elaborazione della query. Riprova con una richiesta più specifica.',
          suggestions: ['Mostra atlete con documenti in scadenza', 'Analizza pagamenti per squadra', 'Statistiche utilizzo pulmini']
        }, 
        timestamp: new Date() 
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery();
    }
  };

  const clearConversation = () => {
    setConversation([]);
  };

  const exportConversation = () => {
    const exportData = conversation.map(msg => ({
      type: msg.type,
      content: msg.type === 'user' ? msg.content : msg.content.summary || msg.content.title,
      timestamp: msg.timestamp.toISOString()
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-assistant-conversation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
              <p className="text-sm text-gray-500">Analisi intelligente dei dati societari</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-lg p-1 mr-4">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'chat' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <MessageSquare className="h-4 w-4 inline mr-1" />
                Chat
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'insights' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-1" />
                Insights
              </button>
            </div>

            {conversation.length > 0 && (
              <button
                onClick={exportConversation}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Esporta conversazione"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex min-h-0">
          {activeTab === 'chat' ? (
            <>
              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {conversation.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <Lightbulb className="h-12 w-12 text-purple-300 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Benvenuto nell'AI Assistant
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Fai una domanda sui tuoi dati o scegli uno dei suggerimenti qui sotto
                      </p>
                      <div className="text-left max-w-2xl mx-auto">
                        <h4 className="font-medium text-gray-900 mb-3">Esempi di query:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[
                            "Mostra atlete con documenti in scadenza",
                            "Analizza pagamenti in ritardo per squadra",
                            "Efficienza utilizzo pulmini per zona",
                            "Atlete che necessitano promozione",
                            "Statistiche gol per squadra",
                            "Incassi totali per tipo pagamento"
                          ].map((example, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSuggestionClick(example)}
                              className="text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-sm"
                            >
                              {example}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    conversation.map((message, index) => (
                      <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-2xl ${message.type === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100'} rounded-lg p-4`}>
                          {message.type === 'user' ? (
                            <p>{message.content}</p>
                          ) : (
                            <ResponseFormatter response={message.content} />
                          )}
                          <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-4 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin">
                            <Brain className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="text-gray-600">Analizando dati...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Fai una domanda sui tuoi dati..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={1}
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      onClick={handleSendQuery}
                      disabled={!query.trim() || isLoading}
                      className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {conversation.length > 0 && (
                    <div className="mt-2 flex justify-between text-sm text-gray-500">
                      <span>{conversation.length} messaggi</span>
                      <button
                        onClick={clearConversation}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        Pulisci conversazione
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Suggestions Sidebar */}
              <div className="w-80 border-l border-gray-200">
                <QuerySuggestions 
                  data={data}
                  stats={stats}
                  onSuggestionClick={handleSuggestionClick}
                />
              </div>
            </>
          ) : (
            /* Insights Tab */
            <div className="flex-1 p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">Insights Automatici</h3>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900">Atlete Totali</h4>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalAthletes}</p>
                    <p className="text-sm text-blue-700">Distribuite in {data.teams.length} squadre</p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-orange-900">Documenti in Scadenza</h4>
                    <p className="text-2xl font-bold text-orange-600">{stats.expiringDocuments}</p>
                    <p className="text-sm text-orange-700">Nei prossimi 30 giorni</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900">Utilizzo Trasporti</h4>
                    <p className="text-2xl font-bold text-green-600">{stats.busUsers}</p>
                    <p className="text-sm text-green-700">Atlete che usano i pulmini</p>
                  </div>
                </div>

                {/* Auto Insights */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Raccomandazioni Automatiche</h4>
                  
                  {stats.ageViolations > 0 && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <h5 className="font-medium text-red-900">⚠️ Anomalie Età Categorie</h5>
                      <p className="text-red-700">{stats.ageViolations} atlete necessitano di cambio categoria</p>
                      <button 
                        onClick={() => handleSuggestionClick('Atlete che necessitano promozione di categoria')}
                        className="mt-2 text-red-600 hover:text-red-800 font-medium"
                      >
                        Visualizza dettagli →
                      </button>
                    </div>
                  )}
                  
                  {stats.expiringDocuments > 0 && (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                      <h5 className="font-medium text-orange-900">📋 Documenti in Scadenza</h5>
                      <p className="text-orange-700">{stats.expiringDocuments} documenti scadranno nei prossimi 30 giorni</p>
                      <button 
                        onClick={() => handleSuggestionClick('Mostra atlete con documenti in scadenza nei prossimi 30 giorni')}
                        className="mt-2 text-orange-600 hover:text-orange-800 font-medium"
                      >
                        Visualizza elenco →
                      </button>
                    </div>
                  )}
                  
                  {stats.pendingPayments > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <h5 className="font-medium text-yellow-900">💰 Pagamenti in Sospeso</h5>
                      <p className="text-yellow-700">{stats.pendingPayments} pagamenti ancora da ricevere</p>
                      <button 
                        onClick={() => handleSuggestionClick('Analizza i pagamenti in ritardo per squadra')}
                        className="mt-2 text-yellow-600 hover:text-yellow-800 font-medium"
                      >
                        Analizza incassi →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;