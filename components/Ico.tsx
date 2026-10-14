"use client";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import {
  Accessibility, Activity, Armchair, BookOpen, Bot, Brain, Building2, CalendarDays, ChartColumn,
  Circle, CircleCheck, ClipboardList, Dumbbell, Eye, Factory, FileText, Flag, Footprints, Hand,
  House, Lightbulb, Link2, Megaphone, MessageSquare, Monitor, Moon, Mouse, MoveUp, PersonStanding,
  Phone, Play, RefreshCw, Repeat, Search, ShieldCheck, ShoppingCart, Stethoscope, Target,
  TrendingDown, TrendingUp, TriangleAlert, User, Users, Utensils, Video,
} from "lucide-react";

type IconCmp = ComponentType<{ size?: number | string; strokeWidth?: number; style?: CSSProperties; fill?: string }>;

/** Table emoji → icône vectorielle (trait fin, couleur héritée du texte). */
const MAP: Record<string, IconCmp> = {
  "📊": ChartColumn, "👥": Users, "📈": TrendingUp, "📉": TrendingDown, "🏋": Dumbbell, "📚": BookOpen,
  "💬": MessageSquare, "🎯": Target, "💻": Monitor, "🖥": Monitor, "🏭": Factory, "🏢": Building2,
  "🩺": Stethoscope, "⚠": TriangleAlert, "✅": CircleCheck, "🎥": Video, "🌙": Moon, "🍽": Utensils,
  "🏃": Footprints, "🔗": Link2, "📄": FileText, "💡": Lightbulb, "📋": ClipboardList, "🛒": ShoppingCart,
  "🔎": Search, "🔍": Search, "🗓": CalendarDays, "📢": Megaphone, "📞": Phone, "🪑": Armchair, "▶": Play,
  "🛡": ShieldCheck, "🤖": Bot, "👤": User, "👁": Eye, "🧠": Brain, "🏠": House, "🚩": Flag, "🖱": Mouse,
  "🟠": Circle,
  // Exercices : plus d'animaux, des pictos neutres
  "🧘": PersonStanding, "🤸": Accessibility, "💪": Dumbbell, "🖐": Hand, "🔄": RefreshCw, "🐱": Repeat,
  "🏹": MoveUp, "🦵": Footprints, "🦆": Activity, "🦅": Activity, "🌿": Activity, "⚾": Circle,
};

const strip = (e: string) => e.replace(/️/g, "");
const EMOJI_RE = new RegExp(
  "(" + Object.keys(MAP).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")\\uFE0F?",
  "g"
);

export function Ico({ e, size = "1.15em", style }: { e: string; size?: number | string; style?: CSSProperties }) {
  const Cmp = MAP[strip(e)];
  if (!Cmp) return <span>{e}</span>;
  return (
    <Cmp
      size={size}
      strokeWidth={2}
      fill={strip(e) === "🟠" ? "currentColor" : undefined}
      style={{ verticalAlign: "-0.2em", marginRight: "0.4em", flexShrink: 0, ...style }}
    />
  );
}

/** Remplace les emojis connus d'un texte par des icônes (à utiliser là où une chaîne est affichée). */
export function withIcons(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const alone = text.replace(EMOJI_RE, "").trim() === "";
  let last = 0, i = 0, m: RegExpExecArray | null;
  EMOJI_RE.lastIndex = 0;
  while ((m = EMOJI_RE.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<Ico key={i++} e={m[1]} style={alone ? { marginRight: 0 } : undefined} />);
    last = m.index + m[0].length;
    if (text[last] === " ") last += 1;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
