import React, { useState, useEffect } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { NICHES_FOR_DROPDOWN, getNicheDetailsByName, TUTORIAL_TYPE_OPTIONS } from '../constants';
import { CollapsibleSection } from './ui/CollapsibleSection';
import { HighRpmNicheDetail } from '../types';

interface IdeaFormProps {
  onGenerate: (userQuery: string, niche: string, appSoftware: string, tutorialType: string) => Promise<void>;
  isLoading: boolean;
}

export const IdeaForm: React.FC<IdeaFormProps> = ({ onGenerate, isLoading }) => {
  const [userQuery, setUserQuery] = useState<string>('');
  const [niche, setNiche] = useState<string>(''); 
  const [appSoftware, setAppSoftware] = useState<string>('');
  const [tutorialType, setTutorialType] = useState<string>('');
  const [selectedNicheDetails, setSelectedNicheDetails] = useState<HighRpmNicheDetail | null>(null);
  const [appSoftwareSuggestions, setAppSoftwareSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (niche) {
      const details = getNicheDetailsByName(niche);
      setSelectedNicheDetails(details || null);
      setAppSoftwareSuggestions(details?.examples || []);
      setAppSoftware(''); // Clear app/software when niche changes
      setTutorialType(''); // Optionally clear tutorial type as well
    } else {
      setSelectedNicheDetails(null);
      setAppSoftwareSuggestions([]);
      setAppSoftware('');
      setTutorialType('');
    }
  }, [niche]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(userQuery, niche, appSoftware, tutorialType);
  };

  const appSoftwarePlaceholder = selectedNicheDetails?.examples?.length 
    ? `e.g., ${selectedNicheDetails.examples[0]}${selectedNicheDetails.examples.length > 1 ? ', ' + selectedNicheDetails.examples[1] : ''}` 
    : "Type or select specific software/tool";
  
  const nicheDescriptionText = selectedNicheDetails?.description 
    ? selectedNicheDetails.description
    : "Select a niche to see its description and software examples.";
  const nicheExamplesText = selectedNicheDetails?.examples?.length 
    ? ` Popular tools include: ${selectedNicheDetails.examples.slice(0,5).join(', ')}...`
    : "";


  return (
    <CollapsibleSection 
        title="✨ Generate New Ideas" 
        defaultOpen={true} 
        className="!rounded-2xl shadow-2xl !bg-opacity-30 hover:!bg-opacity-40 border border-sky-500/30"
        headerClassName="!py-6 !px-6 !text-2xl" 
        contentClassName="!pt-6 !pb-8 !px-6"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <Select
            label="Primary Focus Niche"
            id="niche"
            options={[{value: "", label: "Select a Niche (or AI will suggest)"}, ...NICHES_FOR_DROPDOWN.map(n => ({...n, label: `${n.group} - ${n.label}`}))]}
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            containerClassName="animate-fadeIn" style={{animationDelay: '0.1s'}}
            className="!py-3"
          />
          <div className="animate-fadeIn" style={{animationDelay: '0.2s'}}>
            <Input
                label="Specific App/Software/Tool"
                id="appSoftware"
                type="text"
                value={appSoftware}
                onChange={(e) => setAppSoftware(e.target.value)}
                placeholder={appSoftwarePlaceholder}
                list="appSoftwareDatalist" 
                className="!py-3"
                disabled={!niche} 
              />
              <datalist id="appSoftwareDatalist">
                  {appSoftwareSuggestions.map(suggestion => (
                      <option key={suggestion} value={suggestion} />
                  ))}
              </datalist>
               <p className={`mt-1.5 text-xs ${!niche ? 'text-yellow-400/80' : 'text-[var(--text-tertiary)]'} font-light`}>
                {niche ? "Type custom software or select from suggestions based on chosen niche." : "Select a niche first to see software suggestions."}
              </p>
          </div>
        </div>

        { (selectedNicheDetails || !niche) && (
            <div className="text-xs text-[var(--text-secondary)] text-center font-light animate-fadeIn p-3 bg-[var(--glass-bg-subtle-start)] rounded-lg border border-[var(--glass-border-color)]" style={{ animationDelay: '0.25s' }}>
                <p>
                    {selectedNicheDetails ? (
                        <>
                            <strong>Niche Selected: {selectedNicheDetails.name}</strong> ({selectedNicheDetails.category})
                            <br />
                            {nicheDescriptionText}
                            {nicheExamplesText && <span className="block mt-1">{nicheExamplesText}</span>}
                        </>
                    ) : (
                        "Select a 'Primary Focus Niche' to see its description and software examples. The AI can also provide broad suggestions if left open."
                    )}
                </p>
            </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 animate-fadeIn" style={{animationDelay: '0.3s'}}>
            <Select
                label="Tutorial Type / Content Focus"
                id="tutorialType"
                options={[{value: "", label: "Any Type (AI Default)"}, ...TUTORIAL_TYPE_OPTIONS]}
                value={tutorialType}
                onChange={(e) => setTutorialType(e.target.value)}
                className="!py-3"
                disabled={!niche && !appSoftware}
            />
            <div className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
              <Input
                label="Further Refine AI Suggestion (Optional)"
                id="userQuery"
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="e.g., 'For marketing students', 'Common beginner mistakes', 'Integrating with Zapier'"
                className="!py-3" 
              />
            </div>
        </div>
         <p className="text-xs text-[var(--text-tertiary)] text-center font-light animate-fadeIn -mt-3" style={{animationDelay: '0.45s'}}>
           Use "Tutorial Type" for common formats and "Refine AI Suggestion" for specific audience, pain points, or unique angles.
        </p>
        
        <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            isLoading={isLoading} 
            className="w-full animate-fadeIn !font-bold !tracking-wide" 
            style={{animationDelay: '0.5s'}}
            disabled={isLoading || (!niche && !appSoftware && !userQuery && !tutorialType)}
            title={(!niche && !appSoftware && !userQuery && !tutorialType) ? "Please provide some input to generate ideas" : "Generate Ideas"}
        >
          {isLoading ? 'Generating Ideas...' : 'Generate New Ideas!'}
        </Button>
      </form>
    </CollapsibleSection>
  );
};