import ComparisonTable from './components/ComparisonTable'
import TechnologySelector from './components/TechnologySelector'
import useComparisonSelection, { maxComparisonTechnologies } from './hooks/useComparisonSelection'

export default function ComparePage() {
  const {
    selection,
    selectedTechnologies,
    relationshipsByTechnology,
    failedSlugs,
    loadingSelected,
    availableTechnologies,
    catalogueLoading,
    catalogueError,
    retryCatalogue,
    retryDetails,
    addTechnology,
    removeTechnology,
    clearSelection,
  } = useComparisonSelection()

  return (
    <section className="compare-page" aria-labelledby="compare-page-title">
      <header className="compare-intro">
        <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />Structured comparison</p>
        <h1 id="compare-page-title">Compare technologies.</h1>
        <p>Look across the details that shape where a technology fits. Aster presents the differences without scoring or ranking them.</p>
      </header>

      {(selection.unknownSlugs.length > 0 || selection.duplicateCount > 0 || selection.truncatedCount > 0) && (
        <div className="compare-url-notice" role="status">
          {selection.unknownSlugs.length > 0 && (
            <p>Some technologies in this comparison link were not found: {selection.unknownSlugs.join(', ')}.</p>
          )}
          {selection.duplicateCount > 0 && <p>Duplicate selections were removed from this comparison link.</p>}
          {selection.truncatedCount > 0 && <p>This comparison link included more than four technologies. The first four were kept.</p>}
        </div>
      )}

      <TechnologySelector
        technologies={availableTechnologies}
        selected={availableTechnologies.filter((technology) => selection.slugs.includes(technology.slug))}
        selectedSlugs={selection.slugs}
        loading={catalogueLoading}
        error={catalogueError}
        onAdd={addTechnology}
        onRemove={removeTechnology}
        onClear={clearSelection}
        onRetry={retryCatalogue}
      />

      {selection.slugs.length >= 2 && loadingSelected ? (
        <p className="api-loading-state" role="status">Loading selected technologies…</p>
      ) : failedSlugs.length > 0 ? (
        <section className="api-error-state" role="alert">
          <p>Unable to load all selected technologies and their relationships.</p>
          <button className="text-button" type="button" onClick={retryDetails}>Try again</button>
        </section>
      ) : selection.slugs.length >= 2 && selectedTechnologies.length >= 2 ? (
        <ComparisonTable technologies={selectedTechnologies} relationshipsByTechnology={relationshipsByTechnology} />
      ) : selectedTechnologies.length < 2 ? (
        <section className="compare-prompt" aria-labelledby="compare-prompt-title" aria-live="polite">
          <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />Ready when you are</p>
          <h2 id="compare-prompt-title">
            {selectedTechnologies.length === 0 ? 'Start with two technologies.' : 'Choose one more technology.'}
          </h2>
          <p>
            {selectedTechnologies.length === 0
              ? 'Select at least two technologies to see their context, use cases, and relationships side by side.'
              : `${selectedTechnologies[0].name} is selected. Add another technology to build the comparison.`}
          </p>
        </section>
      ) : null}

      <p className="compare-url-hint">
        This comparison is encoded in its URL and can be refreshed or shared. Up to {maxComparisonTechnologies} technologies can be compared at once.
      </p>
    </section>
  )
}
