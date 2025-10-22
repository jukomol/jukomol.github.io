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

<html>
<body>
<!--StartFragment--><html><head></head><body>
<hr>
<h1>The Problem</h1>
<p>So, picture this.
I’m standing on top of a hill. The wind’s nice, the view’s probably great, except I’m blindfolded.
Somewhere in front of me, there’s a valley, and my job is to find its lowest point.

No GPS, no map. Just my sense of “up” and “down.”

Sounds like a philosophy problem, right?
But this is actually a classic way to think about optimization.</p>
<hr>
<h2>My Approach: The Systematic Scan</h2>
<p>When I first thought about this, I imagined the valley as a <strong>3D matrix</strong> of coordinates:</p>
<p>[<br>
(x, y, z)<br>
]<br>
where (z = f(x, y)) represents the height (or cost) at that point.</p>
<p>I wanted to <strong>scan</strong> the entire valley, step by step, and track:</p>
<ul>
<li>
<p>the lowest point found so far ((z_{\min}))</p>
</li>
<li>
<p>a temporary highest point ((z_\text{temp})) for reference.</p>
</li>
</ul>
<hr>
<h3>The Logic</h3>
<p>Mathematically, that’s just:</p>

<img width="258" height="85" alt="Image" src="https://github.com/user-attachments/assets/aeac94b0-e4b3-47b8-a3d6-a8349c4eed6a" />

<p>and the brute-force approach looks like this:</p>
<pre><code class="language-python">z_min = float('inf')
for x in range(X_range):
    for y in range(Y_range):
        z = f(x, y)
        if z &lt; z_min:
            z_min = z
</code></pre>
<p>That’s a <strong>complete search</strong>, guaranteed to find the minimum, but it’s computationally expensive.</p>
<p>For a grid of size (n \times n):<br>

<img width="317" height="95" alt="Image" src="https://github.com/user-attachments/assets/3ce33984-f58a-4e4a-b367-d8e990c6e4f5" />

</p>
<p>It’s accurate but slow. You’ll get the answer eventually, even if you age doing it.</p>
<hr>
<h2>ASCII Sketch: My Way (Full Scan)</h2>
<pre><code>z ↑
  |                     ● hilltop
  |                   /
  |                /
  |             ● valley floor (lowest z)
  |          /
  |       /
  |    /
  +------------------------------------&gt; (x,y)
</code></pre>
<p>You’re basically moving across this entire landscape, recording every height you encounter.<br>
The good thing? You’ll <em>never miss the lowest point.</em><br>
The bad thing? You’ll also <em>walk over everything else.</em></p>
<hr>
<h2> The Smarter Way, Gradient Descent</h2>
<p>Now let’s think like a mathematician.</p>
<p>Instead of visiting every point, we use the <strong>gradient</strong>, the slope of the surface, to decide which direction to move.</p>
<p>

<img width="245" height="125" alt="Image" src="https://github.com/user-attachments/assets/d7aa1862-0315-4575-a11a-1f7616c4343c" />

</p>
<p>This tells us how the terrain changes around us.<br>
To go downhill, we move <em>opposite</em> to that slope:</p>
<p>

<img width="419" height="61" alt="Image" src="https://github.com/user-attachments/assets/8f6474f9-9639-453a-98d7-fe20106f1ad4" />

</p>
<p>where:</p>
<ul>
<li>
<p>( \eta ) is the learning rate (the size of each step)</p>
</li>
<li>
<p>( t ) is the iteration number</p>
</li>
</ul>
<hr>
<h3>ASCII Diagram: Gradient Descent</h3>
<pre><code>z ↑
  |           hilltop
  |             ●
  |           ↙
  |        ↙
  |     ↙
  |  ● valley (local minimum)
  +---------------------------------&gt; (x,y)
</code></pre>
<p>Each arrow shows a “step downhill.”<br>
You move until you can’t go down anymore, when:

<img width="197" height="64" alt="Image" src="https://github.com/user-attachments/assets/1d02c5fe-1dec-4e26-b245-f949cd435037" />

and<br>

<img width="197" height="85" alt="Image" src="https://github.com/user-attachments/assets/5c117396-5840-4d1b-b7d2-0f2abaecd0c2" />

</p>
<p>That’s a <strong>local minimum</strong>.</p>
<hr>
<h2>Problem: Multiple Valleys</h2>
<p>But what if there are several small dips?<br>
You might get stuck in one of these:</p>
<pre><code>z ↑
  |        ● hill
  |       / \
  |   ● /     \ ●    ← local valleys
  |  /           \
  | ●              ● ← global lowest valley
  +------------------------------------&gt; (x,y)
</code></pre>
<p>The algorithm stops at the first “pit” it finds.<br>
That’s fine if it’s the deepest one, but if not, you’ve missed the global minimum.</p>
<hr>
<h2>Random Restarts, A Practical Fix</h2>
<p>One solution is to <strong>start from multiple random points</strong> and run the descent multiple times.</p>
<p>[<br>
(x_0, y_0) \in \text{Random set of initial positions}<br>
]<br>
and then<br>
[<br>
z_{\min} = \min_i f(x_i^<em>, y_i^</em>)<br>
]</p>
<p>You effectively scatter yourself across the landscape, and at least one version of you will likely find the true bottom.</p>
<hr>
<h2>Simulated Annealing, Smart Risk-Taking</h2>
<p>Sometimes, the only way to find a deeper valley is to <strong>climb a little uphill first</strong>.</p>
<p>Simulated annealing lets you occasionally take uphill steps with a probability:</p>
<p>[<br>
P(\text{accept uphill}) = e^{-\frac{\Delta E}{T}}<br>
]</p>
<p>where:</p>
<ul>
<li>
<p>( \Delta E ) = how much higher the new point is,</p>
</li>
<li>
<p>( T ) = “temperature,” which slowly decreases over time.</p>
</li>
</ul>
<p>At high (T), you’re curious, you explore.<br>
At low (T), you settle down near the best point you’ve found.</p>
<p>This mimics the cooling of metal to reach a stable crystal, or in our case, a <strong>global minimum</strong>.</p>
<hr>
<h3> ASCII View: Annealing Movement</h3>
<pre><code>z ↑
  |       ●
  |      / \     ← small uphill accepted
  |     /   \_   ← goes up slightly, then down deeper
  |    ●     ●
  |             ●  ← global minimum
  +------------------------------------&gt; (x,y)
</code></pre>
<p>You sometimes climb out of a trap, and that’s exactly what makes this method powerful.</p>
<hr>
<h2> Coarse-to-Fine Search, Smarter Scanning</h2>
<p>I still love the idea of scanning.<br>
But instead of walking every inch, I can <strong>zoom in gradually</strong>:</p>
<ol>
<li>
<p>Scan a coarse grid (big steps).</p>
</li>
<li>
<p>Identify the lowest region.</p>
</li>
<li>
<p>Focus there with smaller steps.</p>
</li>
</ol>
<p>That’s <strong>multi-resolution search</strong>, a compromise between full scanning and local descent.</p>
<hr>
<h2> Comparing All the Methods</h2>

Method | Global Info | Time Complexity | Gets Stuck? | Notes
-- | -- | -- | -- | --
My Scan | ✅ Full | (O(n^2)) | No | Guaranteed but slow
Gradient Descent | ❌ Local | (O(k)) | Yes | Fast, simple
Random Restart | ❌ Local | (O(km)) | Low | Multiple tries
Simulated Annealing | ❌ Local + Random | (O(k)) | Rarely | Best tradeoff
Coarse-to-Fine | ✅ Partial | (O(\log n)) | Low | Efficient hybrid


<hr>
<h2>Hybrid Code (Personal + Mathematical)</h2>
<pre><code class="language-python">best_z = float('inf')
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
        if delta &lt; 0 or np.exp(-delta / T) &gt; np.random.rand():
            x, y = x_new, y_new

        T *= 0.99  # gradually cool down

    if f(x, y) &lt; best_z:
        best_z, best_pos = f(x, y), (x, y)
</code></pre>
<p>This combines:</p>
<ul>
<li>
<p>My “keep track of lowest value” logic</p>
</li>
<li>
<p>Gradient descent for slope-following</p>
</li>
<li>
<p>Annealing to escape traps</p>
</li>
</ul>
<p>It’s like walking with <strong>intuition, curiosity, and memory</strong> all at once.</p>
<hr>
<h2> Final Thoughts</h2>
<p>My original scanning approach was brute force, but honest, explore everything, miss nothing.<br>
Mathematically, that’s <strong>global search</strong>.<br>
Efficient methods like gradient descent are cleverer; they use slope, risk, and chance.</p>
<p>But both share the same goal:</p>
<blockquote>
<p>To find meaning in the dark, to locate the bottom of the valley when you can’t see the landscape.</p>
</blockquote>
<p>So whether you’re optimizing code, climbing a career path, or literally hiking blindfolded, <br>
you’re always balancing exploration and exploitation.<br>
You walk, you measure, you adjust, and in the end, you find your valley floor.</p>
<hr>
</body></html><!--EndFragment-->
</body>
</html>