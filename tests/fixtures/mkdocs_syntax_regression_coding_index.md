# Regression fixture: clean admonition with nested code fence after a prior fence

```python
print("before")
```

??? example "Using the utility functions in a script"
    To use the functions defined in `utils.py`, import them in your script.

    ``` py title="main.py" linenums="1"
    import os

    print("inside admonition")
    ```

!!! example "Example results folder structure"
    After running the script, your results might be structured as follows:

    ```text
    results/
    └── run-1/
    ```
