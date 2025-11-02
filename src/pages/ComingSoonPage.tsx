import React from 'react';

type ComingSoonPageProps = {
  title: string;
  description?: string;
  onBack: () => void;
};

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title, description, onBack }) => {
  return (
    <div className="wrap coming-soon-page">
      <header className="coming-soon-page__header">
        <button type="button" className="coming-soon-page__back" onClick={onBack}>
          <span aria-hidden="true">&larr;</span> Back to dashboard
        </button>
    
        <h1 className="coming-soon-page__title">{title}</h1>
        {description && <p className="coming-soon-page__description">{description}</p>}
      </header>
      <div className="coming-soon-page__content">
        <div className="coming-soon-banner" role="status" aria-live="polite">
          Coming soon!
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
