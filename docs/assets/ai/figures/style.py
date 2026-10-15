"""Shared settings for the synthetic Nature main-figure example.

Requirements checked 2026-10-11:
https://research-figure-guide.nature.com/figures/preparing-figures-our-specifications/
https://research-figure-guide.nature.com/figures/building-and-exporting-figure-panels/
DejaVu Sans is a portable preview default; use installed Arial or Helvetica
and inspect the resulting PDF before submission.
"""

from cycler import cycler

WIDTH_MM = 183
HEIGHT_MM = 70
FONT = "DejaVu Sans"
TEXT_PT = 7
PANEL_PT = 8
PREVIEW_DPI = 180
SEED = 7
COLOURS = {"fast": "#0072b2", "slow": "#d55e00", "paired": "#777777"}
MARKER_SIZE = 3
PANEL_OFFSET = (-0.15, 1.04)


def rc_params():
    """Settings belong here so every panel uses the same defaults."""
    return {
        "font.family": "sans-serif",
        "font.sans-serif": [FONT],
        "font.size": TEXT_PT,
        "axes.titlesize": TEXT_PT,
        "axes.labelsize": TEXT_PT,
        "xtick.labelsize": TEXT_PT,
        "ytick.labelsize": TEXT_PT,
        "legend.fontsize": TEXT_PT,
        "axes.prop_cycle": cycler(color=[COLOURS["fast"], COLOURS["slow"]]),
        "text.color": "black",
        "axes.labelcolor": "black",
        "xtick.color": "black",
        "ytick.color": "black",
        "axes.spines.top": False,
        "axes.spines.right": False,
        "axes.grid": False,
        "axes.linewidth": 0.6,
        "lines.linewidth": 0.6,
        "xtick.major.width": 0.6,
        "ytick.major.width": 0.6,
        "pdf.fonttype": 42,
        "ps.fonttype": 42,
        "svg.fonttype": "none",
        "savefig.facecolor": "white",
    }


def figure_size():
    return WIDTH_MM / 25.4, HEIGHT_MM / 25.4


def label_panel(axis, label):
    axis.text(
        *PANEL_OFFSET, label, transform=axis.transAxes,
        fontsize=PANEL_PT, fontweight="bold", fontstyle="normal",
        va="bottom", ha="left",
    )
