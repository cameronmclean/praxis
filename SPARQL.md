Query 1
-----

prefix exemplr: <http://purl.org/NET/exemplr#>
prefix schema: <http://schema.org/>

SELECT DISTINCT ?resource  ?title WHERE {
	?p schema:name "Biophotonic Imaging" .
	?s exemplr:concernsPattern ?p .
	?s exemplr:hasTargetURL ?resource .
	?s exemplr:hasTargetTitle ?title .
}



Query 2
-----

prefix exemplr: <http://purl.org/NET/exemplr#>
prefix schema: <http://schema.org/>

SELECT ?pattern ?force ?targetDetail ?comment WHERE {
	?e exemplr:hasTargetURL <https://peerj.com/articles/688/#p-6> .
	?e exemplr:concernsPattern ?p .
	?p schema:name ?pattern .
	?e exemplr:hasTargetDetail ?targetDetail .
	?e exemplr:concernsForce ?f .
	?f schema:name ?force .
	?e exemplr:hasComment ?comment .
}

Query 3
----

prefix exemplr: <http://purl.org/NET/exemplr#>
prefix schema: <http://schema.org/>

SELECT ?resource ?resourceTitle ?targetDetail ?comment WHERE {
	?e exemplr:concernsForce <http://labpatterns.org/id/pattern/1/force/1> .
	?e exemplr:hasTargetURL ?resource .
	?e exemplr:hasTargetTitle ?resourceTitle .
	?e exemplr:hasTargetDetail ?targetDetail .
	?e exemplr:hasComment ?comment .
	FILTER (regex(?comment, "Zebrafish","i"))
}


Query 4
----

prefix exemplr: <http://purl.org/NET/exemplr#>
prefix schema: <http://schema.org/>

SELECT ?exemplar ?pattern ?force ?targetTitle WHERE {
	?exemplar exemplr:creatorORCID <http://orcid.org/0000-0002-9836-3824> .
	?exemplar exemplr:concernsPattern ?p .
	?p schema:name ?pattern .
	?exemplar exemplr:concernsForce ?f .
	?f schema:name ?force .
	?exemplar exemplr:hasTargetTitle ?targetTitle .
}