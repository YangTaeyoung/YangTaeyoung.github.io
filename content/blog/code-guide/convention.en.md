---
layout: post
title: When a Junior Developer Starts with Code Conventions
date: 2024-05-20
comments: true
translated: true
---

![image](/images/code_guide/convention-1716212794001.png)

When I first joined the company, many things frustrated me. Especially when looking at the code, I wondered why `if` and `for` statements were so nested, why the code was so messy, and why the variable names were so weird, etc.

As you spend time in the company, you can easily attribute these issues to a lack of skills. However, with more real-world experience, improvisation, dealing with plans that differ from existing designs, and other various reasons, even your own development efforts can result in messy code.

Code conventions in collaboration settings help alleviate these issues by implying strong guidelines that can significantly enhance code quality in a short period. (Especially with a culture of code reviews, there is a high chance of positive adoption.)

This post aims to discuss what considerations I had when introducing code conventions and how a junior developer was able to suggest and apply code conventions within the company.

## Why are code conventions necessary?
In fact, code conventions make sense when **there are two or more developers** working together.

In a one-person development scenario, you are responsible for all parts, and since they follow your own rules, there is little need to be bound by code conventions.

However, when aiming for or working with two or more developers, individual coding styles differ. The more developers participating in the project, the more confusing it can become.

Since code conventions impose direct guidelines on the code, they can maintain a certain level of code quality. Additionally, as more people become familiar with the code conventions, the code can be read as if written by a single person, maintaining consistency and ensuring everyone can write predictable code.

However, since imposing rules on code involves potential team member resistance and convincing others of the necessity of code conventions, this post will address how to approach those issues.

## Obstacles in Introducing Code Conventions
Personally, it's not that everyone works in large corporations. Even at startups or medium-sized companies, structured code conventions are not commonly observed. There are several potential reasons for this.

### 1. Initial Startups May Not Desire It
In initial startups that have not yet turned a profit, making and maintaining code conventions are often seen as direct cost issues.

I partly agree with this and also partly disagree.

Even if there is a document establishing code conventions, as long as this document is neglected with version updates of the language or the introduction of new tools, the significance of code conventions may diminish.

Initial startups often prioritize a line of code or a new feature over creating such documents. I believe the management cost of code conventions is considerable, which inevitably leads to certain constraints.

Would a company that changed from JSP to Spring bear the cost of rewriting their code convention documents? Changes in DB connections, controller writing methods, and from SSR approach to Restful API—if supported by a robust code convention document—inevitably increase the cost of handling change.

However, as initial startups grow in size and the number of developers increases, codes with various individuals' intuition may be written. Such codes can complicate maintenance for anyone other than the author. Even simple naming like create or get can be hard to deduce the intended operation.

When such situations persist, or key maintainers leave the company, maintenance difficulties can rise significantly. In these cases, even startups should consider adopting some essential code conventions.

### 2. Code Conventions Must Be Agreed Upon By All
One profound realization as a junior developer is that even if I like a specific method, it can't become a code convention unless other people like it too.

Even if I stayed up all night developing a code convention, if the developers don't follow it, it merely drains my energy.

Therefore, code conventions require collaboration from fellow developers and convincing them of the necessity of code conventions.

Below is an example of the process through which I was able to convince others to establish a code convention.

During a previous service, there was an instance where I almost deleted all labeled data by not applying filtering code at the Service Layer to the Repository Layer. _(Thankfully, it was not in Production.)_

Afterward, I suggested that a validity check should be placed in the Repository to prevent unfiltered modification or deletion of all data. However, I received the following feedback:
1. Introducing this as a code convention just to prevent a one-time error might increase the cost of code development.
   - This was true. Adding validity checks to all data layers would consume not only development time but also the time to write test codes.
2. Isn't the purpose of the Repository Layer unrelated to business logic? By adding validity checks, doesn't it handle business logic?
   - Initially, we defined the Repository Layer in our design to be unrelated to business logic except in special cases. However, by limiting certain actions and fields, the Repository Layer ends up handling a part of the business logic. Some argued that this logic should actually belong in the service layer.

By receiving such feedback, I realized aspects I hadn't considered.

Afterward, I revised the constraints to add validity checks not to all data layers but only crucial data, and thus I was able to gain approval for that code convention.

### 3. Code Conventions Must Be Continuously Managed
Once a code convention is created, it must be consistently maintained. The more detailed it is, the more specific the contents become. However, when changes arise or new technology is introduced, the old code conventions need to be quickly abandoned and rewritten.
This is tiring from a company, team, and individual perspective, as maintaining code conventions can be burdensome.

Thus, when crafting code conventions, there must be personnel to consistently manage them, and careful consideration of the scope and content defined by the conventions is necessary.

## Why Code Conventions Are Still Needed
Despite this, well-defined code conventions help accelerate development.

From a new joiner's perspective, strong restrictions guide the developer on writing code correctly after facing a challenging code review once.

Good code conventions allow for efficient code writing and result in code that everyone in the community can manage.

Previously, when a bug appeared in the company, even in the absence of the developer who wrote the faulty code due to vacations or resignations, it was possible to quickly rectify the issue thanks to the code conventions.

The predictability, thanks to code conventions alone, allowed expectations of what certain code may do.

## Introducing Code Conventions
If you want to implement code conventions, the following aspects might be useful tips.

### Exploring Reference Code Conventions
It's advisable to refer to company-specific code convention documents with references like Google Convention, Airbnb Convention, etc.

As a backend developer, I previously referenced the [Google Cloud method naming rules](https://cloud.google.com/apis/design/naming_convention?hl=ko#method_names) when establishing a code convention for method naming.
> A tip is that having these foundational documents makes it easier to persuade team members. It's a powerful point that not just you but giant developers like Google write codes in this way.

### Using Github Discussion
Github Discussion is a community feature provided by Github. We previously proposed code conventions through this functionality and decided on their adoption through discussions, votes, comments, and labels.

![image](/images/code_guide/convention-1716212280924.png)
> Discussion Example

Of course, a downside is that it's confined to the repository, but previously, we had an Organization Discussion used company-wide on this discussion channel.

### Leveraging Code Reviews
Code reviews are another channel through which code conventions are established. In my experience, many code conventions emerged from various people's code reviews, such as:
1. Use of Early Return Pattern
2. One line break after declaring variables
3. Commenting above data layers if there are more than three data layer calls from a business layer
4. Use of DTO when transferring data between certain layers

Besides these, many code conventions have been established through code reviews.

### Don't Get Discouraged If a Proposal Isn’t Accepted the First Time
As humans, naturally, when a proposal is rejected and not established as a code convention, it can be discouraging.

However, in my experience, sometimes the problem related to a previously rejected code convention resurfaces, leading to its adoption, or another good alternative was found resolving the issue even without establishing it as a code convention.

Therefore, you shouldn't get discouraged and should try multiple methods.

If, after the rejection, the issue did not arise again, you must acknowledge that it could have been an excessive code convention potentially reducing the productivity of the development team.

Code conventions are a very powerful constraint on developer code, so while some conventions work effectively, others can hinder code readability and efficiency.

### Remembering That Code Conventions Are a Costly Choice
It is best to consider code conventions as a last resort for specific topics.

For many reasons discussed above, one must remember that code conventions are a costly choice.

In fact, addressing the issue using other automation tools, development tools, Lints, Formatters, etc., may be more efficient, so these considerations should be prioritized.