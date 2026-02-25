# Online experiments with jsPsych

This page guides you through setting up, managing, and troubleshooting experiments on Pavlovia using the **jsPsych** framework. Follow these steps and best practices to streamline your experiment creation and minimize errors.

For ready-to-use example, please refer to the [Behavioural tasks](../bh-tasks.md) page.

## Learning resources

If you're unfamiliar with jsPsych, it's a good idea to start by learning some basics.

There is plenty of documentation on the [main jsPsych page](https://www.jspsych.org/v7/). In particular, go through the _tutorial_ section, which contains some very accessible, step-by-step instructions on how to build your script.

You can also check out the content from Christophe Bossens' workshop on [online experiments with jsPsych](https://kuleuven.sharepoint.com/:p:/r/sites/T0005824-Hoplab/Shared%20Documents/Hoplab/Research/Behaviour/Experiment%20building/jspsych_workshop_christophe.pptx?d=w7d8cb68a430746bcb4b9bcb6ceddaf23&csf=1&web=1&e=L9FXng).

## The ideal workflow

JsPsych offers a framework to write your experiment in javascript. While this might sound like extra complexity, as compared to using the Psychopy builder or to scripting your experiment in Python, it offers the significant advantage of being directly readable by any browser. The code for your experiment will be written in the `<script>` part of a regular `html` document, which can then be opened like any other webpage.

A basic workflow that you might want to adopt when scripting your experiment is the following:

1. Open your experiment folder in your editor of choice and create a new `index.html` file. Build your javascript code and test it _locally_ by running it in your browser.

    !!! tip
        Since you'll be editing _javascript_, _html_, _css_, but also probably some _python_ code at the same time, it's probably a good idea to use an editor that can handle all of these. A great option is [VSCode](https://code.visualstudio.com/).

2. Once your experiment is well built and running locally, upload it to **GitLab**, which you can access through your Pavlovia account (Dashboard > Profile > click on your account name). You can choose to do this on your own account or the lab account. Once your experiment is created on there, it will show on your Pavlovia dashboard.
3. From there, work on your experiment like you would work on any Git repository: make changes locally and sync your changes with GitLab. Start by adding the [necessary components](https://pavlovia.org/docs/experiments/create-jsPsych) for your script to run on Pavlovia. These will allow your script to communicate with the Pavlovia servers, without which your experiment can't run from Pavlovia.

    !!! info "Using the lab account"
        To run experiments beyond piloting, you may need credits. We have a Hoplab account for this purpose. Ask Klara or Silke how to get access to it.

4. Finish refining your code by repeating this process: make changes locally > sync them with GitLab > try your task on Pavlovia (switch to _Piloting_ or _Running_ to be able to try your task).

    !!! tip
        It can sometimes be cumbersome to go through the complete _local change > commit > test_ loop just to test out a minor code change. An elegant alternative is to use **flags** in your code that will activate or de-activate the Pavlovia components. The latter are just two: a `init` and a `finish` event. Set these behind an `if` statement, and you'll be able to switch from online to local with one flag, so that you can go back to trying your code locally before syncing your changes (see an example [here](https://github.com/TimManiquet/mouse_tracker_template)).

## Common trial types — code examples

Below are minimal examples for common trial types using jsPsych 7. These can be adapted and combined to build a full experiment.

### Image display with keyboard response

```html
<!-- Load the required plugins -->
<script src="https://unpkg.com/@jspsych/plugin-image-keyboard-response"></script>

<script>
var image_trial = {
    type: jsPsychImageKeyboardResponse,
    stimulus: 'img/my_stimulus.png',
    choices: ['f', 'j'],
    prompt: '<p>Press F for category A, J for category B</p>',
    stimulus_height: 400,  // in pixels
    response_ends_trial: true
};
</script>
```

### Fixation cross

```javascript
var fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p style="font-size: 48px;">+</p>',
    choices: "NO_KEYS",
    trial_duration: 500
};
```

### Survey with Likert scale

```html
<script src="https://unpkg.com/@jspsych/plugin-survey-likert"></script>

<script>
var likert_trial = {
    type: jsPsychSurveyLikert,
    questions: [
        {
            prompt: "How confident are you in your response?",
            labels: ["Not at all", "Slightly", "Moderately", "Very", "Extremely"],
            required: true
        }
    ]
};
</script>
```

### Timeline with randomisation

```javascript
var stimuli = [
    { stimulus: 'img/stim_01.png', correct_response: 'f' },
    { stimulus: 'img/stim_02.png', correct_response: 'j' },
    { stimulus: 'img/stim_03.png', correct_response: 'f' }
];

var trial = {
    type: jsPsychImageKeyboardResponse,
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: ['f', 'j'],
    data: {
        correct_response: jsPsych.timelineVariable('correct_response')
    }
};

var block = {
    timeline: [fixation, trial],
    timeline_variables: stimuli,
    randomize_order: true
};
```

For more examples and a full plugin reference, see the [jsPsych documentation](https://www.jspsych.org/v7/plugins/list-of-plugins/).

---

## Common pitfalls on Pavlovia

### Resource preloading

Pavlovia needs to download all media files before the experiment starts. If files are missing or paths are incorrect, the experiment will hang on the loading screen.

- Use the [`jsPsychPreload`](https://www.jspsych.org/v7/plugins/preload/) plugin to explicitly preload images, audio, and video:

    ```javascript
    var preload = {
        type: jsPsychPreload,
        images: ['img/stim_01.png', 'img/stim_02.png'],
        show_progress_bar: true
    };
    ```

- Make sure all file paths are **relative** and match the exact case (Pavlovia's server is case-sensitive, unlike most local setups).

### Data saving

If the experiment crashes or the participant closes the browser, data may be lost. To mitigate this:

- Use [`jsPsych.data.get().csv()`](https://www.jspsych.org/v7/reference/jspsych-data/#jspsychdatagetcsv) in the `on_finish` callback to send data to Pavlovia.
- The Pavlovia plugin handles saving automatically, but make sure you call `jsPsychPavlovia` with the `completedCallback` at the end of your timeline.
- Consider saving intermediate data with periodic `pipe` calls for long experiments.

### File paths and naming

- Avoid spaces and special characters in file names.
- Keep all stimulus files in a subfolder (e.g., `img/`, `audio/`) and reference them with relative paths.
- Double-check that the file structure on GitLab matches your local setup — files that exist locally but were not committed will cause errors on Pavlovia.

---

## Troubleshooting

| Problem | Likely cause | Solution |
|---------|-------------|----------|
| Experiment stuck on loading screen | Missing resource files or incorrect paths | Check browser console (F12) for 404 errors; verify file paths and case sensitivity |
| Data not saved after completion | Pavlovia finish plugin not in timeline | Ensure `jsPsychPavlovia` with `action: 'save'` is the last entry in your timeline |
| Experiment works locally but not on Pavlovia | Local-only code or missing Pavlovia init/finish | Check that `jsPsychPavlovia` init and finish events are included (see [Pavlovia docs](https://pavlovia.org/docs/experiments/create-jsPsych)) |
| Timing seems off | Browser rendering delays | Use the [`jsPsychBrowserCheck`](https://www.jspsych.org/v7/plugins/browser-check/) plugin; avoid relying on frame-level precision for online experiments |
| "Unexpected token" errors | JavaScript syntax issue | Check browser console; common causes are trailing commas, missing semicolons, or ES6 syntax not supported by older browsers |

---

## Using jsPsych plugins

jsPsych's modular plugin system is one of its strengths. To add a plugin:

1. **Find the plugin** in the [plugin list](https://www.jspsych.org/v7/plugins/list-of-plugins/) or search for community plugins on [npm](https://www.npmjs.com/search?q=jspsych-plugin).
2. **Include the script** in your HTML `<head>` section (via CDN or local file):

    ```html
    <script src="https://unpkg.com/@jspsych/plugin-html-button-response"></script>
    ```

3. **Use it in your timeline** by referencing the plugin name (e.g., `jsPsychHtmlButtonResponse`).

!!! tip
    When using multiple plugins, load them all in the `<head>` section before your experiment script. This prevents "plugin not found" errors.

<!--
__TODO__: [Klara] Verify that the Christophe Bossens workshop material link (SharePoint) points to the latest version. Update the link if a newer version is available.
-->
