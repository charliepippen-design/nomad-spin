import { forwardRef, useCallback } from 'react';
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  Navigate as RouterNavigate,
  useNavigate as useRouterNavigate,
  type LinkProps,
  type NavLinkProps,
  type NavigateFunction,
  type NavigateOptions,
  type NavigateProps,
  type To,
} from 'react-router-dom';
import { useLocaleState } from './LocaleProvider';
import { localizeHref } from './paths';

/**
 * Drop-in replacements for the react-router pieces that take a path.
 *
 * Callers keep writing English paths ("/destinations/lisbon"). These send the
 * reader to the page in their language when it is translated, and to the
 * English page when it is not.
 */

/** Turns an English path into the right URL for the reader's language. */
export function useLocalizedHref(): (href: string) => string {
  const { linkLocale } = useLocaleState();
  return useCallback((href: string) => localizeHref(href, linkLocale), [linkLocale]);
}

function useLocalizedTo(): (to: To) => To {
  const localize = useLocalizedHref();
  return useCallback(
    (to: To) => {
      if (typeof to === 'string') return localize(to);
      if (to.pathname) return { ...to, pathname: localize(to.pathname) };
      return to;
    },
    [localize],
  );
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ to, ...rest }, ref) {
  const localize = useLocalizedTo();
  return <RouterLink ref={ref} to={localize(to)} {...rest} />;
});

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink({ to, ...rest }, ref) {
  const localize = useLocalizedTo();
  return <RouterNavLink ref={ref} to={localize(to)} {...rest} />;
});

export function Navigate({ to, ...rest }: NavigateProps) {
  const localize = useLocalizedTo();
  return <RouterNavigate to={localize(to)} {...rest} />;
}

export function useNavigate(): NavigateFunction {
  const navigate = useRouterNavigate();
  const localize = useLocalizedTo();
  return useCallback(
    ((to: To | number, options?: NavigateOptions) => {
      if (typeof to === 'number') navigate(to);
      else navigate(localize(to), options);
    }) as NavigateFunction,
    [navigate, localize],
  );
}
