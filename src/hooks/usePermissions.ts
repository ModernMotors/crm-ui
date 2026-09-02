/**
 * usePermissions
 * Central hook that exposes:
 *  - can(permId)          → boolean
 *  - canPage(pageKey)     → boolean  (can the user even see this page?)
 *  - canAction(page, act) → boolean  (can the user perform this action?)
 *  - visiblePages         → string[] (list of page keys user can access)
 */

import { useAuth } from '@/contexts/auth-context';

// ─── Page → required view permission ─────────────────────────────────────────
export const PAGE_PERMISSIONS: Record<string, {
  view: string;
  create?: string;
  edit?: string;
  delete?: string;
  export?: string;
}> = {
  appointments: { view: 'p19', create: 'p20', edit: 'p21', delete: 'p22' },
  contacts:     { view: 'p14', create: 'p15', edit: 'p16', delete: 'p17', export: 'p18' },
  helpdesk:     { view: 'p28', create: 'p29', edit: 'p30', delete: 'p31' },
  vehicles:     { view: 'p24', create: 'p25', edit: 'p26', delete: 'p27' },
  phonecalls:   { view: 'p14' }, // phone calls linked to contacts module
  branches:     { view: 'p5',  create: 'p6',  edit: 'p7',  delete: 'p8'  },
  knowledge:    { view: 'p48' },  // knowledge = settings view
  roles:        { view: 'p38', create: 'p39', edit: 'p40', delete: 'p41' },
  settings:     { view: 'p48', edit: 'p49' },
  users:        { view: 'p33', create: 'p34', edit: 'p35', delete: 'p36' },
  companies:    { view: 'p1',  create: 'p2',  edit: 'p3',  delete: 'p4'  },
  reports:      { view: 'p43', export: 'p45' },
  sales:        { view: 'p50', create: 'p51', edit: 'p52', delete: 'p53' },
  system:       { view: 'p54' },
};

// Home page is always visible (it is the launcher)
const ALWAYS_VISIBLE = ['home'];

export function usePermissions() {
  const { can, canAny, isSuperAdmin } = useAuth();

  /**
   * Can the user VIEW a page?
   */
  const canPage = (pageKey: string): boolean => {
    if (ALWAYS_VISIBLE.includes(pageKey)) return true;
    if (isSuperAdmin) return true;
    const page = PAGE_PERMISSIONS[pageKey];
    if (!page) return true; // unknown pages — show by default
    return can(page.view);
  };

  /**
   * Can the user perform an action on a page?
   * action: 'view' | 'create' | 'edit' | 'delete' | 'export'
   */
  const canAction = (
    pageKey: string,
    action: 'view' | 'create' | 'edit' | 'delete' | 'export'
  ): boolean => {
    if (isSuperAdmin) return true;
    const page = PAGE_PERMISSIONS[pageKey];
    if (!page) return true;
    const permId = page[action];
    if (!permId) return false;
    return can(permId);
  };

  /**
   * List of page keys the user can see
   */
  const visiblePages = Object.keys(PAGE_PERMISSIONS).filter((key) =>
    canPage(key)
  );

  return { can, canAny, canPage, canAction, visiblePages, isSuperAdmin };
}
