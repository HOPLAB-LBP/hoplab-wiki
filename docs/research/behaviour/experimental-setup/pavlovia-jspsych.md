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

__TODO__: [Klara] Make sure the workshop material from Christophe Bossens is updated to the latest version