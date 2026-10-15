"""Render two synthetic panels using the adjacent shared style.py.

Run: python figure_example.py --output results/figures/example
Requires NumPy and Matplotlib. No real data are read.
"""

import argparse
from datetime import datetime
import hashlib
import json
from pathlib import Path
import sys
from zoneinfo import ZoneInfo

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

import style


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path("results/figures/example"))
    parser.add_argument("--overwrite", action="store_true", help="Replace existing exports")
    args = parser.parse_args()
    outputs = {ext: Path(f"{args.output}.{ext}") for ext in ("pdf", "png", "json")}
    existing = [str(path) for path in outputs.values() if path.exists()]
    if existing and not args.overwrite:
        parser.error(f"Existing outputs: {', '.join(existing)}; use --overwrite to replace")
    args.output.parent.mkdir(parents=True, exist_ok=True)

    rng = np.random.default_rng(style.SEED)
    fast = rng.normal(450, 35, 12)
    slow = fast + rng.normal(20, 8, fast.size)
    differences = slow - fast

    with plt.rc_context(style.rc_params()):
        figure, axes = plt.subplots(1, 2, figsize=style.figure_size(), layout="constrained")
        for first, second in zip(fast, slow):
            axes[0].plot([0, 1], [first, second], color=style.COLOURS["paired"])
        for position, condition, values in ((0, "fast", fast), (1, "slow", slow)):
            axes[0].plot(
                np.full(values.size, position), values, "o",
                color=style.COLOURS[condition], markersize=style.MARKER_SIZE,
            )
        axes[0].set(xticks=[0, 1], xticklabels=["Fast", "Slow"],
                    xlim=(-0.2, 1.2), ylabel="Mean reaction time (ms)",
                    title="Synthetic paired observations")
        axes[1].axhline(0, color=style.COLOURS["paired"])
        axes[1].plot(np.arange(1, differences.size + 1), differences, "o",
                     color=style.COLOURS["slow"], markersize=style.MARKER_SIZE)
        axes[1].set(xlabel="Synthetic participant", ylabel="Slow minus fast (ms)",
                    xticks=[1, 4, 8, 12], title="Synthetic paired differences")
        for label, axis in zip("ab", axes):
            style.label_panel(axis, label)
        # Do not use bbox_inches='tight': it changes the specified physical size.
        figure.savefig(outputs["pdf"])
        figure.savefig(outputs["png"], dpi=style.PREVIEW_DPI)
        plt.close(figure)

    record = {
        "synthetic": True,
        "created": datetime.now(ZoneInfo("Europe/Brussels")).isoformat(),
        "command": sys.argv,
        "seed": style.SEED,
        "participants": int(fast.size),
        "mean_difference_ms": float(differences.mean()),
        "width_mm": style.WIDTH_MM,
        "height_mm": style.HEIGHT_MM,
        "font": style.FONT,
        "versions": {"python": sys.version.split()[0], "numpy": np.__version__,
                     "matplotlib": matplotlib.__version__},
        "sources": {path.name: sha256(path) for path in
                    (Path(__file__), Path(style.__file__))},
        "values": {"fast_ms": fast.tolist(), "slow_ms": slow.tolist(),
                   "differences_ms": differences.tolist()},
        "exports": {ext: {"path": str(outputs[ext]), "sha256": sha256(outputs[ext])}
                    for ext in ("pdf", "png")},
    }
    outputs["json"].write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
    print(f"Synthetic mean difference: {differences.mean():.3f} ms")
    for path in outputs.values():
        print(path)


if __name__ == "__main__":
    main()
