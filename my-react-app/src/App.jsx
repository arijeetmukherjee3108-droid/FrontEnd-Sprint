import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { fetchArtworks, searchArtworks, getImageUrl } from './services/artApi';
import { PERSONAS, generateCritique, speakCritique, stopSpeaking } from './services/groqApi';

/* ============================================
   Sub-Components
   ============================================ */

function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon">🎨</span>
          <div>
            <h1 className="logo-text">ArtRoast</h1>
            <p className="logo-subtitle">Gallery</p>
          </div>
        </div>
        <p className="header-tagline">AI Critics × Timeless Masterpieces</p>
      </div>
    </header>
  );
}

function HeroSection({ onExplore }) {
  return (
    <section className="hero">
      <div className="hero-bg-orb hero-bg-orb-1" />
      <div className="hero-bg-orb hero-bg-orb-2" />
      <div className="hero-bg-orb hero-bg-orb-3" />
      <div className="hero-content">
        <p className="hero-eyebrow">✦ Powered by Groq AI</p>
        <h2 className="hero-title">
          See Masterpieces Through<br />
          <span className="hero-title-accent">Unfiltered Eyes</span>
        </h2>
        <p className="hero-description">
          What happens when a snooty 1880s Parisian critic, a Gen-Z TikToker,
          a conspiracy theorist, and a 5-year-old all walk into the Art Institute of Chicago?
        </p>
        <div className="hero-personas">
          {Object.values(PERSONAS).map((p) => (
            <div key={p.id} className="hero-persona-chip" style={{ borderColor: p.accent }}>
              <span>{p.emoji}</span>
              <span>{p.name}</span>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={onExplore} id="explore-gallery-btn">
          Explore the Gallery
          <span className="btn-arrow">→</span>
        </button>
      </div>
    </section>
  );
}

function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} id="search-form">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search artworks... (e.g. Monet, landscape, portrait)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          id="search-input"
        />
      </div>
      <button
        type="submit"
        className="btn-search"
        disabled={isLoading || !query.trim()}
        id="search-btn"
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
      <button
        type="button"
        className="btn-random"
        onClick={() => onSearch('')}
        disabled={isLoading}
        id="random-btn"
      >
        🎲 Random
      </button>
    </form>
  );
}

function ArtworkSkeleton() {
  return (
    <div className="artwork-card skeleton-card">
      <div className="skeleton skeleton-image" />
      <div className="artwork-card-info">
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text-sm" />
      </div>
    </div>
  );
}

function ArtworkCard({ artwork, onClick, index }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getImageUrl(artwork.image_id, 600);
  const lqip = artwork.thumbnail?.lqip;

  return (
    <div
      className="artwork-card"
      onClick={() => onClick(artwork)}
      style={{ animationDelay: `${index * 0.08}s` }}
      id={`artwork-card-${artwork.id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(artwork)}
    >
      <div
        className="artwork-card-image-wrapper"
        style={lqip ? { backgroundImage: `url(${lqip})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {!imageLoaded && !imageFailed && !lqip && <div className="skeleton skeleton-image" />}
        {!imageFailed && (
          <img
            src={imageUrl}
            alt={artwork.title}
            className={`artwork-card-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="artwork-card-overlay">
          <span className="artwork-card-cta">🎭 Get Roasted</span>
        </div>
      </div>
      <div className="artwork-card-info">
        <h3 className="artwork-card-title">{artwork.title}</h3>
        <p className="artwork-card-artist">{artwork.artist_display || 'Unknown Artist'}</p>
        <p className="artwork-card-date">{artwork.date_display}</p>
      </div>
    </div>
  );
}

function PersonaSelector({ selected, onSelect }) {
  return (
    <div className="persona-selector" id="persona-selector">
      <p className="persona-selector-label">Choose Your Critic:</p>
      <div className="persona-buttons">
        {Object.values(PERSONAS).map((persona) => (
          <button
            key={persona.id}
            className={`persona-btn ${selected === persona.id ? 'active' : ''}`}
            onClick={() => onSelect(persona.id)}
            style={{
              '--persona-accent': persona.accent,
              '--persona-gradient': persona.gradient,
            }}
            id={`persona-btn-${persona.id}`}
          >
            <span className="persona-btn-emoji">{persona.emoji}</span>
            <div className="persona-btn-text">
              <span className="persona-btn-name">{persona.name}</span>
              <span className="persona-btn-title">{persona.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CritiquePanel({ critique, persona, isLoading, error, onSpeak, isSpeaking }) {
  if (isLoading) {
    return (
      <div className="critique-panel loading">
        <div className="critique-loading">
          <div className="loading-spinner" />
          <p className="loading-text">
            {persona ? `${PERSONAS[persona].emoji} ${PERSONAS[persona].name} is studying the artwork...` : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="critique-panel error">
        <div className="critique-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!critique) {
    return (
      <div className="critique-panel empty">
        <p className="critique-empty-text">
          ← Select an artwork and pick a critic persona to get a roast!
        </p>
      </div>
    );
  }

  const currentPersona = PERSONAS[persona];

  return (
    <div
      className="critique-panel has-critique animate-fade-in"
      style={{ '--persona-accent': currentPersona.accent }}
    >
      <div className="critique-header">
        <div className="critique-persona-badge" style={{ background: currentPersona.gradient }}>
          <span>{currentPersona.emoji}</span>
          <span>{currentPersona.name}</span>
        </div>
        <button
          className={`btn-speak ${isSpeaking ? 'speaking' : ''}`}
          onClick={onSpeak}
          title={isSpeaking ? 'Stop Speaking' : 'Read Aloud'}
          id="speak-btn"
        >
          {isSpeaking ? '⏹️' : '🔊'}
        </button>
      </div>
      <div className="critique-body">
        {critique.split('\n').filter(Boolean).map((para, i) => (
          <p key={i} className="critique-paragraph" style={{ animationDelay: `${i * 0.15}s` }}>
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}

function ArtworkModal({ artwork, onClose }) {
  const [selectedPersona, setSelectedPersona] = useState('parisian');
  const [critique, setCritique] = useState(null);
  const [isLoadingCritique, setIsLoadingCritique] = useState(false);
  const [critiqueError, setCritiqueError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = getImageUrl(artwork.image_id, 1200);

  const handleGenerateCritique = useCallback(async (personaId) => {
    setIsLoadingCritique(true);
    setCritiqueError(null);
    setCritique(null);
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const result = await generateCritique(artwork, personaId);
      setCritique(result);
    } catch (err) {
      setCritiqueError(err.message);
    } finally {
      setIsLoadingCritique(false);
    }
  }, [artwork]);

  const handlePersonaSelect = (personaId) => {
    setSelectedPersona(personaId);
    handleGenerateCritique(personaId);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else if (critique) {
      const utterance = speakCritique(critique, selectedPersona);
      if (utterance) {
        setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
      }
    }
  };

  // Generate initial critique on mount
  useEffect(() => {
    handleGenerateCritique(selectedPersona);
    return () => stopSpeaking();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        stopSpeaking();
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        stopSpeaking();
        onClose();
      }
    }} id="artwork-modal">
      <div className="modal-content">
        <button className="modal-close" onClick={() => { stopSpeaking(); onClose(); }} id="modal-close-btn">✕</button>

        <div className="modal-grid">
          {/* Left: Artwork Image */}
          <div className="modal-artwork-side">
            <div className="modal-image-wrapper">
              {!imageLoaded && <div className="skeleton skeleton-image" />}
              <img
                src={imageUrl}
                alt={artwork.title}
                className={`modal-artwork-image ${imageLoaded ? 'loaded' : ''}`}
                onLoad={() => setImageLoaded(true)}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="modal-artwork-details">
              <h2 className="modal-artwork-title">{artwork.title}</h2>
              <p className="modal-artwork-artist">{artwork.artist_display || 'Unknown Artist'}</p>
              <div className="modal-artwork-meta">
                {artwork.date_display && <span className="meta-chip">{artwork.date_display}</span>}
                {artwork.medium_display && <span className="meta-chip">{artwork.medium_display.substring(0, 60)}</span>}
                {artwork.place_of_origin && <span className="meta-chip">📍 {artwork.place_of_origin}</span>}
              </div>
            </div>
          </div>

          {/* Right: Critique Side */}
          <div className="modal-critique-side">
            <PersonaSelector selected={selectedPersona} onSelect={handlePersonaSelect} />
            <CritiquePanel
              critique={critique}
              persona={selectedPersona}
              isLoading={isLoadingCritique}
              error={critiqueError}
              onSpeak={handleSpeak}
              isSpeaking={isSpeaking}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>
          <span className="footer-logo">🎨 ArtRoast Gallery</span> — Built for the AI-Assisted Frontend Sprint
        </p>
        <p className="footer-tech">
          Art Institute of Chicago API • Groq LLM (Llama 3.3 70B) • React + Vite
        </p>
      </div>
    </footer>
  );
}

/* ============================================
   Main App
   ============================================ */

function App() {
  const [artworks, setArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHero, setShowHero] = useState(true);

  const loadArtworks = useCallback(async (query = '', pageNum = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (query) {
        result = await searchArtworks(query, 12);
        setSearchTerm(query);
      } else {
        // Random page for variety
        const randomPage = pageNum || Math.floor(Math.random() * 100) + 1;
        result = await fetchArtworks(randomPage, 12);
        setSearchTerm('');
      }
      setArtworks(result.artworks);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExplore = () => {
    setShowHero(false);
    loadArtworks();
  };

  const handleSearch = (query) => {
    loadArtworks(query, 1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadArtworks(searchTerm || '', nextPage);
  };

  return (
    <div className="app">
      <Header />

      {showHero && <HeroSection onExplore={handleExplore} />}

      {!showHero && (
        <main className="main-content">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />

          {error && (
            <div className="error-banner" id="error-banner">
              <span>⚠️</span>
              <p>{error}</p>
              <button onClick={() => loadArtworks()} className="btn-retry">Retry</button>
            </div>
          )}

          <section className="gallery-section" id="gallery">
            {searchTerm && (
              <p className="search-results-label">
                Results for "<strong>{searchTerm}</strong>"
              </p>
            )}

            <div className="gallery-grid">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <ArtworkSkeleton key={i} />)
                : artworks.map((art, i) => (
                    <ArtworkCard
                      key={art.id}
                      artwork={art}
                      onClick={setSelectedArtwork}
                      index={i}
                    />
                  ))
              }
            </div>

            {!isLoading && artworks.length === 0 && !error && (
              <div className="empty-state">
                <p className="empty-state-icon">🖼️</p>
                <p>No artworks found. Try a different search term!</p>
              </div>
            )}

            {!isLoading && artworks.length > 0 && (
              <div className="gallery-actions">
                <button className="btn-primary" onClick={handleLoadMore} id="load-more-btn">
                  Discover More Art
                  <span className="btn-arrow">→</span>
                </button>
                <button className="btn-random-gallery" onClick={() => loadArtworks('')} id="shuffle-btn">
                  🎲 Shuffle Gallery
                </button>
              </div>
            )}
          </section>
        </main>
      )}

      {selectedArtwork && (
        <ArtworkModal
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
        />
      )}

      <Footer />
    </div>
  );
}

export default App;
