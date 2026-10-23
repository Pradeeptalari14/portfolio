---
description: "Build a platform scorecard from DORA and adoption data"
argument-hint: "<metrics export or description of current data sources>"
---

# /platform-engineer:platform-scorecard

Build a platform scorecard from DORA and adoption data.

## Usage

```
/platform-engineer:platform-scorecard $ARGUMENTS
```

## Steps

1. Normalise the supplied data into the four DORA metrics.
2. Compute adoption per platform capability.
3. Highlight the weakest capability and the teams most affected.
4. Recommend one focus area for the next quarter.

## Output

A scorecard table with trends and a single prioritised recommendation.

If the input is missing or ambiguous, ask one focused question before continuing.
