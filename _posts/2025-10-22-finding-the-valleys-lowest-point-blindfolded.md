---
title: "Finding the Valley’s Lowest Point, Blindfolded!"
date: 2025-10-22
author: "Jahir Uddin"
tags:
  - "Machine Learning"
  - "Gradient Descent"
  - "Optimization"
  - "Algorithm"
---

# The Problem

So, picture this.  
I’m standing on top of a hill. The wind’s nice, the view’s probably great, except I’m **blindfolded**.  
Somewhere in front of me, there’s a valley, and my job is to find its **lowest point**.

No GPS. No map. Just my sense of “up” and “down.”

Sounds like a philosophy problem, right?  
But this is actually a classic way to think about **optimization**.

---

## My Approach: The Systematic Scan

When I first thought about this, I imagined the valley as a **3D matrix** of coordinates:

```
(x, y, z)
```

where \( z = f(x, y) \) represents the height (or cost) at that point.

I wanted to **scan** the entire valley, step by step, and track:

- the lowest point found so far \( (z_{\min}) \)
- a temporary highest point \( (z_\text{temp}) \) for reference

---

### The Logic

Mathematically, that’s just:

\[
z_{\min} = \min_{x, y} f(x, y)
\]

and the brute-force approach looks like this:

```python
z_min = float('inf')
for x in range(X_range):
    for y in range(Y_range):
        z = f(x, y)
        if z < z_min:
            z_min = z
```

That’s a **complete search**, guaranteed to find the minimum, but it’s computationally expensive.

For a grid of size \( n \times n \):

\[
\text{Time Complexity} = O(n^2)
\]

It’s accurate but slow. You’ll get the answer eventually, even if you age doing it.

---

## ASCII Sketch: My Way (Full Scan)

```
z ↑
  |                     ● hilltop
  |                   /
  |                /
  |             ● valley floor (lowest z)
  |          /
  |       /
  |    /
  +------------------------------------> (x,y)
```

You’re basically moving across this entire landscape, recording every height you encounter.  
The good thing? You’ll *never miss the lowest point.*  
The bad thing? You’ll also *walk over everything else.*

---

## ⚙️ The Smarter Way, Gradient Descent

Now let’s think like a mathematician.

Instead of visiting every point, we use the **gradient**, the slope of the surface, to decide which direction to move.

\[
\nabla f(x, y) =
\begin{bmatrix}
\frac{\partial f}{\partial x} \\
\frac{\partial f}{\partial y}
\end{bmatrix}
\]

This tells us how the terrain changes around us.  
To go downhill, we move **opposite** to that slope:

\[
(x_{t+1}, y_{t+1}) = (x_t, y_t) - \eta \nabla f(x_t, y_t)
\]

where:
- \( \eta \) is the learning rate (the size of each step)
- \( t \) is the iteration number

---

### ASCII Diagram: Gradient Descent

```
z ↑
  |           hilltop
  |             ●
  |           ↙
  |        ↙
  |     ↙
  |  ● valley (local minimum)
  +---------------------------------> (x,y)
```

Each arrow shows a “step downhill.”  
You move until you can’t go down anymore, when:

\[
\nabla f(x, y) = 0
\]
and
\[
\nabla^2 f(x, y) > 0
\]

That’s a **local minimum**.

---

## Problem: Multiple Valleys

But what if there are several small dips?  
You might get stuck in one of these:

```
z ↑
  |        ● hill
  |       / \
  |   ● /     \ ●    ← local valleys
  |  /           \
  | ●              ● ← global lowest valley
  +------------------------------------> (x,y)
```

The algorithm stops at the first “pit” it finds.  
That’s fine if it’s the deepest one, but if not, you’ve missed the global minimum.

---

## Random Restarts, A Practical Fix

One solution is to **start from multiple random points** and run the descent multiple times.

\[
(x_0, y_0) \in \text{Random set of initial positions}
\]

and then

\[
z_{\min} = \min_i f(x_i^*, y_i^*)
\]

You effectively scatter yourself across the landscape, and at least one version of you will likely find the true bottom.

---

## Simulated Annealing, Smart Risk-Taking

Sometimes, the only way to find a deeper valley is to **climb a little uphill first**.

Simulated annealing lets you occasionally take uphill steps with a probability:

\[
P(\text{accept uphill}) = e^{-\frac{\Delta E}{T}}
\]

where:
- \( \Delta E \) = how much higher the new point is
- \( T \) = “temperature,” which slowly decreases over time

At high \( T \), you’re curious, you explore.  
At low \( T \), you settle down near the best point you’ve found.

This mimics the cooling of metal to reach a stable crystal, or in our case, a **global minimum**.

---

### ASCII View: Annealing Movement

```
z ↑
  |       ●
  |      / \     ← small uphill accepted
  |     /   \_   ← goes up slightly, then down deeper
  |    ●     ●
  |             ●  ← global minimum
  +------------------------------------> (x,y)
```

You sometimes climb out of a trap, and that’s exactly what makes this method powerful.

---

## Coarse-to-Fine Search, Smarter Scanning

I still love the idea of scanning.  
But instead of walking every inch, I can **zoom in gradually**:

1. Scan a coarse grid (big steps)
2. Identify the lowest region
3. Focus there with smaller steps

That’s **multi-resolution search**, a compromise between full scanning and local descent.

---

## Comparing All the Methods

| Method | Global Info | Time Complexity | Gets Stuck? | Notes |
|--------|--------------|----------------|--------------|-------|
| My Scan | ✅ Full | \(O(n^2)\) | No | Guaranteed but slow |
| Gradient Descent | ❌ Local | \(O(k)\) | Yes | Fast, simple |
| Random Restart | ❌ Local | \(O(km)\) | Low | Multiple tries |
| Simulated Annealing | ❌ Local + Random | \(O(k)\) | Rarely | Best tradeoff |
| Coarse-to-Fine | ✅ Partial | \(O(\log n)\) | Low | Efficient hybrid |

---

## Mathematical Comparison: My Way vs Gradient Descent

| Concept | My Scan | Gradient Descent |
|----------|----------|------------------|
| Function | \( f(x,y) \) sampled at all points | \( f(x,y) \) followed along slope |
| Complexity | \( O(n^2) \) | \( O(k) \) |
| Guarantee | Always finds global min | Only local min |
| Movement Rule | Fixed step, full sweep | \( -\eta \nabla f(x,y) \) |
| Feedback | None | Uses local slope |
| Analogy | Feeling every stone | Feeling the slope beneath your feet |

---

## Hybrid Code (Personal + Mathematical)

```python
best_z = float('inf')
best_pos = None

for start in random_starts:
    x, y = start
    step = 1.0
    T = 1.0  # annealing temperature

    for _ in range(1000):
        grad = gradient(f, x, y)
        x_new = x - step * grad[0]
        y_new = y - step * grad[1]
        delta = f(x_new, y_new) - f(x, y)

        # accept downhill or small uphill step
        if delta < 0 or np.exp(-delta / T) > np.random.rand():
            x, y = x_new, y_new

        T *= 0.99  # gradually cool down

    if f(x, y) < best_z:
        best_z, best_pos = f(x, y), (x, y)
```

This combines:
- My “keep track of lowest value” logic  
- Gradient descent for slope-following  
- Annealing to escape traps  

It’s like walking with **intuition, curiosity, and memory** all at once.

---

## Final Thoughts

My original scanning approach was **brute force but honest**, explore everything, miss nothing.  
Mathematically, that’s **global search**.  
Efficient methods like gradient descent are cleverer; they use slope, risk, and chance.

But both share the same goal:

> To find meaning in the dark, to locate the bottom of the valley when you can’t see the landscape.

So whether you’re optimizing code, climbing a career path, or literally hiking blindfolded,  
you’re always balancing exploration and exploitation.  
You walk, you measure, you adjust, and in the end, you find your valley floor.