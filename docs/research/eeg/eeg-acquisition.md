# BioSemi EEG manual

This manual is based on the BioSemi EEG manual from the Cognitive Control in Context (CogTex) research group led by Eva Van den Bussche and was modified by Chiu-Yueh Chen and Klara Schevenels. It is specifically written for the 128-channel BioSemi EEG system located in PSI room 00.52. Eva's lab also provides a [video user tutorial](https://www.youtube.com/watch?v=ZuJ4i9Q7po8&feature=youtu.be) (for their 64-channel BioSemi system), which is highly recommended to watch given the many similarities with our system.

!!! info "Do's and don'ts"
    - You might want to ask your participants to **wash their hair the morning of the test session** for optimal contact between the skull and the electrodes.
    - **Always keep one battery charging.** Batteries can break if they are fully discharged (“deep discharge”), but there’s no risk of damage from overcharging.
    - **Keep the connectors dry.** During cleaning, only the caps and electrodes should get wet. To protect the connectors, wrap them carefully in a towel or plastic bag.
    - **Avoid using hot air for drying.** If you need to speed-dry a wet cap, you may use a blow dryer—but only with cold air.
    - **Report low supplies or broken equipment.** Immediately inform the lab manager (currently [Klara Schevenels](https://www.kuleuven.be/wieiswie/nl/person/00116743)) if something appears broken or stock is running low (e.g., towels, Signa gel, shampoo, adhesive tape, interdental brushes, etc.). The equipment is costly, so handle electrodes and other items with great care.
    - **Do not change any hardware or permanent software settings** (e.g., monitor refresh rate) without approval from the EEG lab manager.
    - **Reserve your slots via Calira.** Make sure all your lab sessions are properly scheduled. If you don’t yet have an account, contact [Klara](https://www.kuleuven.be/wieiswie/nl/person/00116473).
    - If you are planning to use the EEG lab for your experiment, ask Klara to add you to the **EEG channel on the NeuroSPACE Slack** through which everything related to the EEG lab is communicated.
    - **Transfer your data after each session.** For example, make sure to copy your data at the end of the day. The computers are regularly cleaned, and it’s your own responsibility to avoid data loss.
    - **Always return the key of the EEG lab to the locker** when you’re not in the lab. You can find the key in the keybox next to the coffee machine on the ground floor. You can ask [Klara](https://www.kuleuven.be/wieiswie/nl/person/00116473) for the code.

## Before the day: planning participants

Before collecting data you will need to recruit particpants and plan their visit to the lab. Here are a few things to have in mind for that. 

### Recruiting participants

To find participants, you can follow the instructions on the [behavioural recruitment page](../behaviour/bh-participants.md). Make sure to follow the latest guidelines on participant credit and reimbursement (see the latest details from the relevant [ethical applications](https://kuleuven.sharepoint.com/:f:/r/sites/T0005824-Hoplab/Shared%20Documents/Hoplab/Research/Ethical%20applications?csf=1&web=1&e=s7CEuL) - *access required*).

Make sure to mention the specifics of going through an EEG experiment in your recruitment text: the duration, receiving gel in the hair, ... (in general, it is best to make sure participants know what they are registering for to avoid drop-outs). Also mention that **wearing glasses** is preferred to wearing contact lenses (to minimise blinking).

If you are collecting data over the summer, mind that the EEG room can get warm. Look up the forecast and try to avoid testing on very hot days if possible.

### Planning your time slot

To ensure correct use of the EEG testing room, we use a booking system via **[Calira](https://app.clustermarket.com/login)**. Make sure to book your time slots well in advance. If you don’t yet have an account, contact [Klara Schevenels](https://www.kuleuven.be/wieiswie/nl/person/00116743) to get access.

When planning your sessions, make sure to allocate enough time for setting up the EEG cap and electrodes (up to 45-60 minutes, depending on your experience and the participant's hair type). Also, allocate some time at the end of the session for removing the cap and cleaning up (probably around 20-30 minutes).


## On the day: before the participant arrives

These are the first things to do upon arriving in the EEG lab:

1. Switch on the stimulus presentation computer and the EEG acquisition computer. If you don't know the credentials of the computers check [this document](https://kuleuven.sharepoint.com/:w:/r/sites/T0005824-Hoplab/Shared%20Documents/Hoplab/Research/EEG/eeg-computer-info.docx?d=wccddd39191864b9891c0f51cfb6fdf6f&csf=1&web=1&e=AUEUtv) (**access required**).
2. Swith on the general power strip and the A/D-box in the EEG booth using the on/off switch (see **Figure 1**).
3. Check on the A/D-box whether its battery is charged. If the battery is low, a red light will turn on (see **Figure 1**). In that case, take out the battery by opening the black clips at the sides and replace it with the spare battery that can be found in the left corner of the desk with the stimulus computer. Make sure that one battery is always charging (see **Figure 2**). At a later stage you can also check the battery status in ActiView (see **Figure 10**).

![A/D-box](../../assets/eeg-acquisition-fig1.png)
![A/D-box battery](../../assets/eeg-acquisition-fig2.png)

You can find all necessary materials in the EEG closet in the room. Make sure that everything is within reach. It is easiest to prepare all the following items on the round table next to the closet, away from the computers:

1. Fill two syringes with Signa gel. Do not fill them completely to the rim (see **Figure 3**). Make sure to clean gel remainders off the tip of the tube before and after filling the syringes to prevent old gel from blocking them (see **Figure 4**).
2. Order and untie the electrodes. If you use the external electrodes, make sure the electrodes and the cleaning scrub to disinfect the participants' face before applying the electrodes are within reach.
3. Place the measuring tape and adhesive tape within reach.
4. Make sure the head cap you need is dry. You can speed-dry it with the hair dryer, but use **cold air only** to not damage the cap. We have the following caps:
    - 2x small-medium (head circumference of 52-56 cm)
    - 1x medium (head circumference of 54-58 cm)
    - 2x medium-large (head circumference of 56-60 cm)

![Syringe filling](../../assets/eeg-acquisition-fig3.png)
![Syringe cleaning](../../assets/eeg-acquisition-fig4.png)

## Upon participant arrival

It is probably the first time for your participant to participate in an EEG-experiment. As it may be a bit scary for them, make sure to explain everything slowly and in great detail. Prepare the participant for data acquisition as follows:

1. Explain the procedure to the participant.
2. Give the participant enough time to read the information sheet, ask questions, and sign the informed consent.
3. Ask the participant to remove earrings, hair elastics, smartwatches, etc.
4. In case the participant wears glasses, it is easiest to remove them for the application of the EEG cap and the electrodes. Right before the start of the experiment, the participant can put their glasses back on. If possible, ask the participant to wear glasses rather than contact lenses to decrease the blinking frequency during the experiment.
5. Measure the participant's linear distance from nasion (indentation at the top of the nose between the eyes) to inion (small bump just above the neck) to determine the correct cap size (see **Figure 5**). The sizes can be found on the label in the back of the cap (e.g., if you measure 54 cm, then take the small-medium sized head cap with range 52-56 cm).

    ![Measuring head circumference](../../assets/eeg-acquisition-fig5.png)

6. Place the cap on the participant's head: Spread both of your hands in the cap and ask the participant to hold the front part. Make sure both the ears and the label on the back stick out of the cap.
7. Make sure the cap is properly centered by measuring whether A1 (Vertex) is in the center, i.e., halfway between the ears and halfway between the nasion and inion (see **Figure 6**). Adjust if necessary.

    ![Centering the electrode cap](../../assets/eeg-acquisition-fig6.png)

8. Close the cap with the velcro straps under the chin. To avoid itching from the velcro, you can add a gauze pad underneath. Make sure that the participant is comfortable.
9. Fill all electrode gaps with superconducting gel (see **Figure 7a**) in the following way:
    - Gently fiddle around with the syringe in the gap, as this moves hair aside. Ask the participant for feedback to avoid scratching their scalp too hard.
    - Squeeze a small amount of gel in the gap while moving the syringe upwards.

    !!! warning "Important"
        Too much gel can create “bridges” between individual electrodes. Be especially careful around the CMS/DRL electrodes as these are crucial for proper data collection. It is easier to add extra gel later than to remove an excess of gel. As a reference, you should be able to use one tube of Signa gel for +- 5 participants (but this might vary with individual factors such as hair thickness and density).

    !!! tip "Tip"
        You may notice that you easily lose track of the gaps that you have already filled. It can help to come up with a system (e.g., start from the back, or if you are with two experimenters you can each start from a side and work your way to the middle).

10. Carefully put the electrodes in the appropriate gaps (see **Figure 7b**). The electrodes are divided over 4 sets of 32 electrodes (labeled with the letters A to D). When you are done, tape the electrodes to the participant's shoulder or the chair to avoid putting stress on the cables. At the very end, also apply the set with the DRL and CMS electrodes.

    !!! warning "Important"
        Electrodes easily damage, so always handle them with great care. Do not put too much pressure when you insert the electrodes to avoid pushing gel downwards causing it to spread below the cap.

    !!! tip "Tip"
        Per set, individual electrodes are numbered. Place the electrodes in ascending order to avoid tangling the wires. Start at the base of the skull and work your way up towards the forehead. Make sure the wires end up in the participant's neck.

    ![Applying gel and electrodes](../../assets/eeg-acquisition-fig7.png)

11. Go into the EEG booth, let the participant take place in the right position for the experiment, take off the protective caps from the electrode sets and carefully connect them to the A/D-box (see **Figure 8**). Make sure the participant sits comfortably to avoid them moving too much during the experiment. You can adjust the height of the chair and the chin rest if needed.

    ![Connecting the electrodes](../../assets/eeg-acquisition-fig8.png)

12. In case the participant wears glasses, you can put them back on now.
13. Turn the lights low (the light switch is near the door) and make sure the lightning is consistent across all your participants. Do not lower the lights too much as a high contrast between the room and monitor increases the blinking frequency. During breaks, you might want to turn the lights up (to increase alertness) and ask the participant if they would like to drink some water (to decrease swallowing).

## Setting-up the datafile

Go to the acquisition computer, and take care of the following steps:

1. Start up ActiView.

    <figure markdown="span">
    ![ActiView settings](../../assets/eeg-acquisition-fig9.png)
    <figcaption>Figure 9. Setting up your datafile in ActiView.</figcaption>
    </figure>

2. In the right top corner you can check the battery status of the A/D-box (see **Figure 9**). ActiView will give a warning if the battery status is below 20%.
3. Go to the `about actiview` tab and click `set up configuration file`. Choose the 128-channel configuration file. You can find the one that was previously used by Elahe' and Chiu-Yueh in the desktop folder named `KS`. You can load this one, but please do check whether the specifications match your experiment needs.  
4. Click `start` and then `start file` (see **Figure 10**). Browse to your personal folder where you want to save the data, create a participant folder (e.g., `sub-001`) and choose a name for your data file, preferably in BIDS-format (e.g., `sub-<participant_id>_task-<task_name><mapping>_run-<run_number>_eeg.bdf`). To save each run in a different file, you will have to redo this step for each run.
5. Change the decimation according to your needs (see **Figure 9**), e.g., to ¼ (gives you a 512 Hz sampling rate; those are fractions of 2048 Hz).  
6. Go to the `electrode offset` tab to check the electrode impedances and change the displayed range scale to 50 µV (see **Figure 10**):
    - The impedance of each electrode must be between -20 µV and 20 µV (note that this measure is actually an electrode offset value with the CMS electrode as a reference, so negative values are not actually negative). Adjust the electrodes that are not within these values (e.g., Fz in **Figure 10**) by adding or removing some gel, moving the hair below the electrode with the tip of the syringe and/or by wiggling the electrode a bit.
    - If the electrode impedance stays far outside the [-20 20 µV] range, the electrode might be broken and needs to be replaced. In case this electrode is not crucial for your study, you can write down the code of the electrode and later contact the EEG lab manager for the back-up electrode set.  

    <figure markdown="span">
    ![Electrode offsets](../../assets/eeg-acquisition-fig10.png)
    <figcaption>Figure 10. Checking impedence in the electrode offset tap.</figcaption>
    </figure>

    !!! Tip
        You can mirror the screen of the acquisition pc with the electrode offsets in the EEG booth, so that you don't have to run back and forth when adjusting the electrodes to get the impedance right. Don't forget to turn off the screen when you are done.

7. Go back to the `monopolar display` tab and check the signal:
    - **Bridges** would appear in the signal as a set of neighbouring electrodes giving exactly the same or a unusual signal, along with very similar impedance values in adjacent electrodes. You would for example notice that fixing the impedance in one channel also affects its neighbour(s). Note that eyeblinks also can create sudden similar changes in multiple (frontal) channels, this is not bridging.
    - A bad connection of the reference electrode results in a bad signal for all electrodes (see **Figure 11a**). Check whether the DRL and CMS electrodes are placed correctly and give a good signal.
    - If the cap label is not sticking out, this results in a typical signal distortion. (see **Figure 11b**)
    - If all electrodes are connected correctly, Actiview should look like **Figure 12**.
    - Show the participant what happens when they blink, cough, swallow, etc. Instruct the participant to minimize these movements during the measurement phase.

    <figure markdown="span">
    ![distorted EEG signal](../../assets/eeg-acquisition-fig11.png) 
    <figcaption>Figure 11. (A) This pattern typically results from a bad connection of the DRL or CMS electrodes; (B) This pattern typically results from the cap label not sticking out of the cap.</figcaption>
    </figure>


    <figure markdown="span">
    ![good EEG signal](../../assets/eeg-acquisition-fig12.png)
    <figcaption>Figure 12. Ideally, your signal should look something like this when everything is properly connected.</figcaption>
    </figure>
   
## Recording EEG-data

Hooray, you are now ready to start acquiring EEG-data! To do so, follow these steps on the acquisition pc:

1. Start recording (= saving data to file) by clicking the `paused` button in ActiView on the bottom right. When recording, it switches to `saving` and turns green (see **Figure 12**). **Do not forget this** (you wouldn't be the first)!
2. Give your participant the last instructions (a little bit of shouting is necessary) and start the experiment on the stimulus pc.
3. When an experiment run is finished, click on `pause save` below the green `saving` button and then on `stop` on the top left of the screen.
4. Continue to record another run with a different filename by clicking `start`, `start file` and entering your new filename in BIDS (see earlier). Do not forget to restart the recording by clicking the `paused` button again so that it switches to `saving` and turns green. If you want all your data to be saved in one file, you can skip this step. However, in that case the file size can become inconveniently large.
5. The data is saved in the folder you selected earlier. Make sure to copy the data from the acquisition computer to your personal drive at the end of your experiment. Occasionally, the EEG computer will be cleaned and your data might be lost if it is not backed-up.
6. When you are done, turn off the A/D-box, the general power strip and the lights in the EEG booth.

    !!! tip "Tip"
        Make sure to write down the "bad channels" (i.e., with impedances below or above 20 mV) on your Case Report Form (you can find an example [here](https://kuleuven.sharepoint.com/:x:/r/sites/T0005824-Hoplab/Shared%20Documents/Hoplab/Research/EEG/log_EEG_participants.xlsx?d=wa29320cdb14c4e989a3c5eed41b4c61a&csf=1&web=1&e=R982GF)) for each run separately (the impedances can change throughout the experiment), such that you can take this into account in your analysis (e.g., interpolation).

## After the experiment

1. Unplug the electrode sets from the A/D-box (4 sets + mini-set with DRL and CMS electrodes).
2. Put the protective caps back on the connectors, put the connectors in a waterproof plastic bag and use an elastic band to close the bag. **The connectors are very sensitive and should not get wet!**
3. Escort the participant out of the EEG booth to the preparation room and put a towel on the participant's shoulders to prevent gel leaking on their clothes.
4. Remove the electrodes from the cap **one-by-one**. Do not pull on the wires but on the electrode itself, to avoid damage to the wires.
5. **Make sure the electrodes never touch metal**, this is especially a risk if the chair of the participant contains a lot of metal.  
6. Once all electrodes are removed, place them in the plastic tub (not directly in the metal sink!). Remove the head cap from the participant's head and place it in the tub as well.  
7. Let the participant wash the gel out off their hair in the sink. Below the sink we have shampoo caps they can use.
8. Have the participant sign the reward list if they participate for a monetary reward.  

## Cleaning

1. Put the leftover gel in the syringes back in the tube. 
2. Soak the syringes, head cap and electrode sets (not the connectors!) in the plastic tub filled with lukewarm water. Use the shower head to rinse the material.
3.	If after soaking and rinsing the electrodes there is still gel left around the electrode tips, carefully brush the gel off with a soft toothbrush. Do this only if really necessary. Use a plastic toothpick to remove the gel from all the gaps in the head cap.
4.	Fill the tub with clean lukewarm water and add a bit of the 70% alcohol solution to it. Soak the electrodes, the head cap and the syringes in it for a few seconds to disinfect them. 
5.	Rinse everything again with lukewarm water and let the caps and syringes dry on the round table. Put the electrode sets back on the rack (make sure they are stable and don't fall on the floor).

<!--

__TODO__: [Klara] Add info on how to (quickly) check the triggers, how to (quickly) check bridging and what to do in case of the "could not open port 'COM2'" error message (reconnect cables connecting the trigger box with either stimulus or acquisition pc and/or restart both pcs).

__TODO__: [Klara] Update new things since pc switch (config file, program for screen res, line in script to get correct com port)

__TODO__: [Klara] Update new cleaning protocol (without toothbrush, see BioSemi manual)

__TODO__: [Klara] Add lab logistics info (paper to count towels + overview of materials + info on how to wash towels and ordering stuff e.g gel, paper towels, Kruidvat names of the cleaning materials)
-->


