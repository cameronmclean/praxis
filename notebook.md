praxis notebook
===============

#####20150504
First stab at firefox add-on. The idea being to create a simple extension that can grab highlighted elements from the window DOM, and via the context menu match to pattern forces, and send the links made as small JSON-LD/RDF to a pattern exemplification store. This can then be offered as a SPARQL endpoint for querying over all the captured pattern examples.

First step was to install jpm
https://www.npmjs.com/package/jpm
`sudo npm install jpm -g`

Then to install the v38 beta version of firefox (currenty in Desktop/beta/).

Created new git repo to house the add-on development. Decided to call it praxis. cute.
then cd to praxis/ and `jpm init`

followed basix tut https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Getting\_Started_%28jpm%29 just to see if things are working ..
and... yes! after a bit of fiddling. for it to work, must specify the binary location with -b like so...
`jpm -b /Users/cameronmclean/Desktop/beta/Firefox.app run`
Sweeeeet.
Now to mess with context menus and see if I can pull in a list of patterns from the labpatterns.org/patternlist resource...
Not sure yet, but I think I can use any npm package just as for node.js/hyperPatterns by `npm install xyx --save` and this will get packaged with the add on (and presumably browserified type thing?)

So anyway, before I get too carried aways, next to define the minimal/simple requirements that this add-on should provide.. Then think of the best way to implement it.

Also, for this project, perhaps try https://github.com/SublimeLinter/SublimeLinter-for-ST2 and think about writing tests as I go for important things...
https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Unit_testing
https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level\_APIs/test_assert

