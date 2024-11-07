import React, { useEffect, useState } from 'react';
import MetaEditor from './MetaEditor';

const TabChangeTitle: React.FC = () => {
    const messages: string[] = [
        "Quit already?",
        "Where'd you go?",
        "Don't leave yet!",
        "Back so soon?",
        "Taking a break?",
        "We miss you!",
        "Lost in the tabs?",
        "Don't run away!",
        "Nap time?",
        "Come back soon!",
        "Is it snack time?",
        "Running away, huh?",
        "Don't ghost me!",
        "I’ll wait… forever.",
        "You’re just one click away!",
        "Orgamix still loves you!",
        "Tab’s lonely without you!",
        "Thought you’d left me!",
        "You’re on a mission, huh?",
        "Did I lose you to Netflix?",
        "Did I lose you to Facebook?",
        "Did I lose you to Netflix?",
        "Did I lose you to Instagram?",
        "Did I lose you to Twitter?",
        "Did I lose you to YouTube?",
        "Is this a bad time?",
        "C’mon, don’t leave me hanging!",
        "Your coffee's getting cold!",
        "Did you forget about me?",
        "Stuck in tab traffic?",
        "Too cool for this tab?",
        "Tabs are life, don’t abandon me!",
        "Not ready to go, are you?",
        "I knew you'd come back!",
        "Let’s not say goodbye yet!",
      
      ];
      

  const getRandomMessage = () => {
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const [title] = useState(document.title);
  const [currentTitle, setCurrentTitle] = useState(document.title);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Change to a random message when the user leaves the tab
        setCurrentTitle(getRandomMessage());
      } else {
        // Restore the custom title when the user returns to the tab
        setCurrentTitle(title);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [title]);

  useEffect(() => {
    // Update the document title whenever `currentTitle` state changes
    document.title = currentTitle;
  }, [currentTitle]);

  return (
    <MetaEditor
      title={currentTitle}  // Use currentTitle to keep it in sync with the state
      description="Orgamix - A productivity app"
    />
  );
}

export default TabChangeTitle;
