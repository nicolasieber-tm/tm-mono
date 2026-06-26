import { useState, useCallback } from 'react';
import type { Element } from '../types';

export type PageType = 'invoice' | 'deckblatt';

interface UseMultiPageResult {
  activePage: PageType;
  setActivePage: (page: PageType) => void;
  invoiceElements: Element[];
  deckblattElements: Element[];
  setInvoiceElements: React.Dispatch<React.SetStateAction<Element[]>>;
  setDeckblattElements: React.Dispatch<React.SetStateAction<Element[]>>;
  currentElements: Element[];
  setCurrentElements: React.Dispatch<React.SetStateAction<Element[]>>;
}

/**
 * Manages two independent element lists for the invoice editor: the regular
 * invoice page and the optional Deckblatt (cover page). The active page
 * determines which list is currently being edited on the canvas.
 */
export function useMultiPage(
  initialInvoiceElements: Element[] = [],
  initialDeckblattElements: Element[] = []
): UseMultiPageResult {
  const [activePage, setActivePage] = useState<PageType>('invoice');
  const [invoiceElements, setInvoiceElements] = useState<Element[]>(initialInvoiceElements);
  const [deckblattElements, setDeckblattElements] = useState<Element[]>(initialDeckblattElements);

  const currentElements = activePage === 'invoice' ? invoiceElements : deckblattElements;

  const setCurrentElements: React.Dispatch<React.SetStateAction<Element[]>> = useCallback(
    (value) => {
      if (activePage === 'invoice') {
        setInvoiceElements(value);
      } else {
        setDeckblattElements(value);
      }
    },
    [activePage]
  );

  return {
    activePage,
    setActivePage,
    invoiceElements,
    deckblattElements,
    setInvoiceElements,
    setDeckblattElements,
    currentElements,
    setCurrentElements,
  };
}
