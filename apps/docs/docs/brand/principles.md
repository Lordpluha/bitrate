---
sidebar_position: 3
---

# Principles

What [simplicity](./positioning.md#core-value) means in practice — the principles that support it,
the architectural rule that protects it, and the things Bitrate refuses to do. To apply these to a
specific feature, use the [decision filter](./decision-filter.md).

## Supporting principles

### Clarity
A user should understand where they are, what is happening, what happens next, and when to expect a result.

### Predictability
Trust should come from the system consistently doing what it says it will do.

### Transparency
Statuses, timelines, requirements, money, limitations, and important decisions should be understandable rather than hidden behind vague language.

### Progressive depth
The default path is simple. Advanced control exists when the user wants it, without being forced on everyone.

### Openness
Bitrate should integrate rather than isolate. Partners, labels, distributors, and other music businesses should eventually be able to connect through APIs and infrastructure.

### Respect
Do not waste the user's attention. Do not manufacture frustration. Do not manipulate people into paying.

## Architecture principle

External providers are implementation details, not the product model.

Core product concepts should remain provider-independent so that distribution, payments, analytics, storage, or other providers can be replaced without redesigning the user experience.

This is what lets the [ecosystem strategy](./strategy.md#ecosystem-strategy) change underneath a
product that stays stable.

## Anti-principles

Bitrate should never intentionally:

- make the free experience bad to sell Premium;
- use intrusive advertising as a conversion weapon;
- promise artistic or financial success;
- turn into a generic social network for engagement metrics;
- expose complexity simply because the underlying industry is complex;
- add features only to look larger than competitors;
- lock users into Bitrate when interoperability would serve them better;
- make professional tools inaccessible to beginners through unnecessary jargon.
