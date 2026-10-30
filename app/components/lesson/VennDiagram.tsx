"use client";

import type { VennRegion } from "../../lessons/types";

type VennDiagramProps = {
  sets: { a: string[]; b: string[] };
  selected: VennRegion | null;
  onSelect: (region: VennRegion) => void;
  regionLabels: Record<VennRegion, string>;
};

const regions: VennRegion[] = ["a-only", "intersection", "b-only", "outside"];

export function VennDiagram({ sets, selected, onSelect, regionLabels }: VennDiagramProps) {
  const intersection = sets.a.filter((member) => sets.b.includes(member));
  const aOnly = sets.a.filter((member) => !sets.b.includes(member));
  const bOnly = sets.b.filter((member) => !sets.a.includes(member));
  function activate(region: VennRegion) {
    onSelect(region);
  }

  return (
    <div className="venn-wrap">
      <svg className="venn-svg" viewBox="0 0 520 280" role="img" aria-labelledby="venn-title venn-description">
        <title id="venn-title">Interactive Venn diagram</title>
        <desc id="venn-description">Choose the part of the diagram that represents your answer. The overlapping region is the intersection.</desc>
        <rect className={`venn-region venn-region--outside ${selected === "outside" ? "venn-region--selected" : ""}`} x="5" y="5" width="510" height="270" rx="22" onClick={() => activate("outside")} />
        <circle className={`venn-region venn-region--a ${selected === "a-only" ? "venn-region--selected" : ""}`} cx="205" cy="140" r="90" onClick={() => activate("a-only")} />
        <circle className={`venn-region venn-region--b ${selected === "b-only" ? "venn-region--selected" : ""}`} cx="315" cy="140" r="90" onClick={() => activate("b-only")} />
        <text className="venn-set-label" x="155" y="65">A</text>
        <text className="venn-set-label" x="355" y="65">B</text>
        <text className="venn-member-label" x="168" y="145">{aOnly.join(", ")}</text>
        <text className="venn-member-label" x="260" y="145">{intersection.join(", ") || "∅"}</text>
        <text className="venn-member-label" x="350" y="145">{bOnly.join(", ")}</text>
      </svg>
      <div className="venn-controls" role="group" aria-label="Venn diagram answer regions">
        {regions.map((region) => (
          <button
            key={region}
            type="button"
            className={`venn-control ${selected === region ? "venn-control--selected" : ""}`}
            aria-pressed={selected === region}
            onClick={() => activate(region)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                activate(region);
              }
            }}
          >
            {regionLabels[region]}
          </button>
        ))}
      </div>
    </div>
  );
}
