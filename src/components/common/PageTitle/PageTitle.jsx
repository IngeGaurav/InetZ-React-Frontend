import { useEffect } from 'react';
import { APP_NAME } from '@/constants/appConstants';

/**
 * Declaratively sets document.title from any component.
 * Place inside each page component.
 *
 * @param {string} title - Page title (appended with " | AppName")
 * @param {string} [description] - Updates the meta description
 */
const PageTitle = ({ title, description }) => {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    return () => {
      document.title = APP_NAME;
    };
  }, [title, description]);

  return null;
};

export { PageTitle };
