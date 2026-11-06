"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Compass,
  FileText,
  FolderCode,
  Gamepad2,
  House,
  Mail,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { navigation } from "@/lib/navigation";
import { profile } from "@/lib/profile";
import styles from "./site-header.module.css";

const icons = {
  home: House,
  cv: FileText,
  journey: Compass,
  projects: FolderCode,
  game: Gamepad2,
  contact: Mail,
};

function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("portfolio-theme");
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
        document.documentElement.dataset.theme = saved;
      }
    } catch {
      /* Dark mode also works without browser storage. */
    }
  }, []);
  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem("portfolio-theme", nextTheme);
    } catch {
      /* Optional preference. */
    }
  }
  const Icon = theme === "dark" ? Sun : Moon;
  return (
    <button
      className={styles.themeButton}
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "dark" ? "Activer le thème clair" : "Activer le thème sombre"
      }
      aria-pressed={theme === "light"}
    >
      <Icon size={18} aria-hidden="true" />
    </button>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const menu = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    }
    function onPointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !header.current?.contains(event.target)
      )
        setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);
  return (
    <header className={styles.header} ref={header}>
      <div className={styles.inner}>
        <Link
          className={styles.brand}
          href="/"
          onClick={() => setOpen(false)}
          aria-label={`${profile.name}, accueil`}
        >
          <span className={styles.logo} aria-hidden="true">
            <i />Z
          </span>
          <span>{profile.name}</span>
        </Link>
        <nav
          id="navigation-principale"
          ref={menu}
          className={`${styles.navigation} ${open ? styles.open : ""}`}
          aria-label="Navigation principale"
        >
          {navigation.map((item) => {
            const Icon = icons[item.icon];
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.active : ""} ${item.icon === "game" ? styles.game : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <Icon size={17} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className={styles.actions}>
          <ThemeToggle />
          <button
            ref={menuButton}
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="navigation-principale"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <X size={21} aria-hidden="true" />
            ) : (
              <Menu size={21} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
