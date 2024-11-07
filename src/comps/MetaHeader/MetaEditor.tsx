import React from 'react';
import { Helmet } from 'react-helmet';

interface MetaEditorProps {
  title: string;
  description: string;
  keywords?: string; // Optional, to allow flexibility
}

const MetaEditor: React.FC<MetaEditorProps> = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />} {/* Render only if keywords are provided */}
    </Helmet>
  );
}

export default MetaEditor;
