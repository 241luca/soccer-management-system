-500 focus:ring-blue-500"
                    placeholder="https://www.instagram.com/tuoprofilo"
                    disabled={!canEdit}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="inline-flex items-center">
                      <span className="mr-2">🐦</span> Twitter/X
                    </span>
                  </label>
                  <input
                    type="url"
                    value={formData.socialTwitter || ''}
                    onChange={(e) => handleInputChange('socialTwitter', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://twitter.com/tuoprofilo"
                    disabled={!canEdit}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="inline-flex items-center">
                      <span className="mr-2">📺</span> YouTube
                    </span>
                  </label>
                  <input
                    type="url"
                    value={formData.socialYoutube || ''}
                    onChange={(e) => handleInputChange('socialYoutube', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://www.youtube.com/c/tuocanale"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Salva Modifiche
              </>
            )}
          </button>
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{organization._count?.users || 0}</p>
            <p className="text-sm text-gray-600">Utenti</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{organization._count?.athletes || 0}</p>
            <p className="text-sm text-gray-600">Atlete</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{organization._count?.teams || 0}</p>
            <p className="text-sm text-gray-600">Squadre</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetails;
