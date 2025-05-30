import React, { useState } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { NICHES_FOR_DROPDOWN } from '../constants';
import { CollapsibleSection } from './ui/CollapsibleSection';


interface IdeaFormProps {
  onGenerate: (userQuery: string, niche: string, appSoftware: string) => Promise<void>;
  isLoading: boolean;
}

export const IdeaForm: React.FC<IdeaFormProps> = ({ onGenerate, isLoading }) => {
  const [userQuery, setUserQuery] = useState<string>('');
  const [niche, setNiche] = useState<string>(''); 
  const [appSoftware, setAppSoftware] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(userQuery, niche, appSoftware);
  };

  return (
    <CollapsibleSection 
        title="✨ Generate New Ideas" 
        defaultOpen={true} 
        className="!rounded-2xl shadow-2xl !bg-opacity-30 hover:!bg-opacity-40 border border-sky-500/30" // Distinct border for main form
        headerClassName="!py-6 !px-6 !text-2xl" 
        contentClassName="!pt-6 !pb-8 !px-6"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <Select
            label="Primary Focus Niche"
            id="niche"
            options={[{value: "", label: "Select a Niche (or AI will suggest)"}, ...NICHES_FOR_DROPDOWN]}
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            containerClassName="animate-fadeIn" style={{animationDelay: '0.1s'}}
            className="!py-3"
          />
          <Input
            label="Specific App/Software (Recommended)"
            id="appSoftware"
            type="text"
            value={appSoftware}
            onChange={(e) => setAppSoftware(e.target.value)}
            placeholder="e.g., 'ChatGPT', 'Zelle', 'Thinkorswim'"
            containerClassName="animate-fadeIn" style={{animationDelay: '0.2s'}}
            className="!py-3"
          />
        </div>
         <p className="text-xs text-[var(--text-tertiary)] text-center font-light animate-fadeIn" style={{animationDelay: '0.3s'}}>
           Select a niche and/or app for tailored AI suggestions. The AI can also suggest areas if these are left broad.
        </p>

        <div className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <Input
            label="Refine AI Suggestion (Optional)"
            id="userQuery"
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="e.g., 'Beginner guides for marketers', 'Troubleshooting login issues', 'New features for video editing'"
            className="!text-lg !py-3.5" // Larger text and padding
          />
          <p className="mt-1.5 text-xs text-[var(--text-tertiary)] font-light">Further guide the AI with specifics like target audience, video style, or particular problems.</p>
        </div>
        
        <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            isLoading={isLoading} 
            className="w-full animate-fadeIn !font-bold !tracking-wide" // Bolder font and tracking
            style={{animationDelay: '0.5s'}}
        >
          {isLoading ? 'Generating Ideas...' : 'Generate New Ideas!'}
        </Button>
      </form>
    </CollapsibleSection>
  );
};