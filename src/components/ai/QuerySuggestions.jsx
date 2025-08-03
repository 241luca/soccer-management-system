// components/ai/QuerySuggestions.jsx
import React, { useState, useMemo } from 'react';
import { Lightbulb, Users, FileText, CreditCard, Bus, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';

const QuerySuggestions = ({ data, stats, onSuggestionClick }) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set(['dashboard']));

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const suggestionCategories = useMemo(() => {
    return {
      dashboard: {
        title: 'Panoramica Generale',
        icon: BarChart3,
        color: 'blue',
        suggestions: [
          'Riassunto generale dello stato società',
          'Problemi urgenti da risolvere',
          'Statistiche principali per categoria',
          'Performance finanziarie complessive',
          'Efficienza operativa trasporti'
        ]
      },
      athletes: {
        title: 'Gestione Atlete',
        icon: Users,
        color: 'green',
        suggestions: [
          'Atlete che necessitano promozione di categoria',
          'Lista atlete per posizione e squadra',
          'Analisi età media per squadra',
          'Atlete con più di 2 cartellini gialli',
          'Performance gol per squadra',
          'Atlete senza documenti validi',
          'Distribuzione geografica atlete'
        ]
      },
      documents: {
        title: 'Documenti e Scadenze',
        icon: FileText,
        color: 'orange',
        suggestions: [
          'Mostra atlete con documenti in scadenza nei prossimi 30 giorni',
          'Documenti scaduti che bloccano l\'attività',
          'Stato conformità per squadra',
          'Calendario rinnovi documenti',
          'Atlete con documentazione incompleta'
        ]
      },
      payments: {
        title: 'Pagamenti e Finanze',
        icon: CreditCard,
        color: 'purple',
        suggestions: [
          'Analizza i pagamenti in ritardo per squadra',
          'Incassi totali per tipo pagamento',
          'Previsioni incassi mensili',
          'Squadre con più pagamenti in sospeso',
          'Metodi di pagamento più utilizzati',
          'Tasso di pagamento per categoria'
        ]
      },
      transport: {
        title: 'Trasporti e Logistica',
        icon: Bus,
        color: 'indigo',
        suggestions: [
          'Efficienza utilizzo pulmini per zona geografica',
          'Zone sottoutilizzate per trasporto',
          'Analisi costi-benefici per zona',
          'Atlete senza assegnazione pulmino',
          'Suggerimenti redistribuzione zone',
          'Occupazione media pulmini'
        ]
      },
      analytics: {
        title: 'Analisi Avanzate',
        icon: BarChart3,
        color: 'teal',
        suggestions: [
          'Trend iscrizioni negli ultimi mesi',
          'Correlazione età-performance sportive',
          'Analisi retention rate per squadra',
          'Impatto zone geografiche sui pagamenti',
          'Previsioni budget stagionale',
          'Efficienza gestionale complessiva'
        ]
      }
    };
  }, []);

  // Suggestions personalizzate basate sui dati attuali
  const contextualSuggestions = useMemo(() => {
    const suggestions = [];
    
    if (stats.ageViolations > 0) {
      suggestions.push({
        text: `Risolvi ${stats.ageViolations} anomalie età immediate`,
        urgent: true,
        category: 'urgent'
      });
    }
    
    if (stats.expiringDocuments > 0) {
      suggestions.push({
        text: `Gestisci ${stats.expiringDocuments} documenti in scadenza`,
        urgent: true,
        category: 'urgent'
      });
    }
    
    if (stats.pendingPayments > 0) {
      suggestions.push({
        text: `Sollecita ${stats.pendingPayments} pagamenti in sospeso`,
        urgent: false,
        category: 'urgent'
      });
    }

    // Suggestions basate su pattern dei dati
    const busUsageRate = (stats.busUsers / stats.totalAthletes * 100).toFixed(1);
    if (busUsageRate < 50) {
      suggestions.push({
        text: `Ottimizza trasporti (${busUsageRate}% utilizzo)`,
        urgent: false,
        category: 'optimization'
      });
    }

    return suggestions;
  }, [stats]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <h3 className="font-medium text-gray-900">Suggerimenti Query</h3>
        </div>
        <p className="text-xs text-gray-500">
          Clicca su una query per eseguirla automaticamente
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Contextual Suggestions */}
        {contextualSuggestions.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">🔥 Azioni Prioritarie</h4>
            <div className="space-y-2">
              {contextualSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion.text)}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                    suggestion.urgent
                      ? 'border-red-200 bg-red-50 hover:bg-red-100 text-red-800'
                      : 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800'
                  }`}
                >
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categorized Suggestions */}
        <div className="p-4 space-y-2">
          {Object.entries(suggestionCategories).map(([key, category]) => {
            const isExpanded = expandedCategories.has(key);
            const IconComponent = category.icon;
            
            return (
              <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(key)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-4 w-4 text-${category.color}-500`} />
                    <span className="text-sm font-medium text-gray-900">
                      {category.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({category.suggestions.length})
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-2 space-y-1">
                      {category.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => onSuggestionClick(suggestion)}
                          className="w-full text-left p-2 text-sm text-gray-700 hover:bg-white hover:text-gray-900 rounded transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Stats for Context */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-3">📊 Dati Disponibili</h4>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Atlete totali:</span>
              <span className="font-medium">{stats.totalAthletes}</span>
            </div>
            <div className="flex justify-between">
              <span>Squadre:</span>
              <span className="font-medium">{data.teams.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Partite programmate:</span>
              <span className="font-medium">{stats.upcomingMatches}</span>
            </div>
            <div className="flex justify-between">
              <span>Pulmini disponibili:</span>
              <span className="font-medium">{data.buses.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Zone geografiche:</span>
              <span className="font-medium">{data.zones.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuerySuggestions;