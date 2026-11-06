# -*- coding: utf-8 -*-
"""
Created on Tue Apr  8 20:53:55 2025


"""

import pydicom
import numpy as np

def calculate_slice_timing(tr, num_slices, multiband_factor):
    """
    Calculate the slice timing order for fMRI data according to a specific interleaved pattern.
    In this pattern, acquisition starts from both ends of the slice stack towards the middle,
    with the first and the middle slice starting at time 0, and so on in pairs.

    :param tr: Repetition time (TR) in seconds.
    :param num_slices: Total number of slices.
    :param multiband_factor: Multiband acceleration factor (how many slices per time bin).
    :return: A list of slice timings in seconds, compatible with BIDS format.
    """
    # Time per slice is the TR divided by the number of slice groups (half the number of slices)
    time_per_slice = tr / (num_slices / multiband_factor)
    # Initialize slice timings array with zeros
    slice_timings = np.zeros(num_slices)
    
    for i in range(num_slices // multiband_factor):
        # Time for the current pair of slices
        current_time = i * time_per_slice
        # Set timing for a pair: one from the start and one from the middle
        slice_timings[i] = current_time
        slice_timings[i + num_slices // multiband_factor] = current_time

    return slice_timings

def extract_dicom_info(f):
    """
    Extracts TR and the total number of slices from a DICOM file.
    
    :param f: Path to the DICOM file.
    :return: Tuple containing the TR in seconds and the total number of slices.
    """
    d = pydicom.dcmread(f, stop_before_pixels=True)

    # Extract TR (Repetition Time)
    if hasattr(d, "RepetitionTime"):
        tr = float(d.RepetitionTime) / 1000  # Convert from ms to seconds
    elif (0x0018, 0x0080) in d:
        tr = float(d[(0x0018, 0x0080)].value) / 1000
    else:
        raise AttributeError("Repetition Time (TR) not found in DICOM metadata.")

    # Extract Number of Slices
    if (0x2001, 0x1018) in d:
        num_slices = int(d[(0x2001, 0x1018)].value)
    else:
        raise AttributeError("Number of slices not found in DICOM metadata.")

    return tr, num_slices


# Set filename to the DICOM image file
dicom_fname = 'D:/eccShp_fMRI/sourcedata/sub-00/dicom/DICOM/00000001/IM_0002'

# Get relevant info
tr, num_slices = extract_dicom_info(dicom_fname)
multiband_factor = 2

# Get the slice timing
# NOTE: this assumes an ascending order (FH), where the first time bin takes
#       the first slice and the slice at half. For instance, if you have 60 
#       slices, at time 0 you get slice 1 and 31, at time 1 slice 2-32, etc.  
#       For single-band, see https://neurostars.org/t/how-dcm2niix-handles-different-imaging-types/22697/4
slice_timings = calculate_slice_timing(tr, num_slices, multiband_factor)

# Print results
print(f"TR: {tr} seconds")
print(f"Number of Slices: {num_slices}")
print(f"Slice Timings: {slice_timings}")
