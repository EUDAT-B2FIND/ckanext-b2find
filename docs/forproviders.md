# For Providers

## Guidelines
Welcome to the guidelines of EUDAT’s metadata service B2FIND for data providers. B2FIND gathers diverse metadata on the research output of many heterogeneous sources with the aim of providing a unified discovery portal. The portal then allows widespread and cross-disciplinary search and access to the underlying data collections. These guidelines are intended to provide information about the requirements for successful metadata integration into B2FIND.

### Providing Metadata
In order to join B2FIND, the data provider must meet a few requirements:

* The data provider must agree with the licensing principles of B2FIND, see the [Terms of Use](https://www.eudat.eu/eudat-cdi-aup) of EUDAT Services and the [Legal Notice](https://www.dkrz.de/en/about-en/contact/impressum?set_language=en) of DKRZ.
* In particular, the provider must consent to the provided metadata being made publicly available and openly accessible under CC-BY International v.4.0 or subsequent without any restrictions on reuse in original and derivative forms. 
   ***Note: This open access licence only applies to the metadata records published and visible in the B2FIND portal, not to the underlying data collections referred to and described by the B2FIND datasets.*** 
* The data provider agrees to the metadata being made available for free in B2FIND and also for it to be harvested by and re-distributed to other metadata aggregators. No confidential metadata should be provided (although the described research data sets themselves may have access limitations). 
* Copyright-protected metadata can only be published if there is a licence agreement between the data provider and EUDAT that meets the B2FIND requirements.
* An interface to retrieve metadata must be available, accessible and usable. 

The Metadata provided should be stable and 'good enough'. Some of the central issues include:
* Metadata records should be as complete as possible.
* Metadata shall not be encrypted or obfuscated.
* Metadata must use Unicode with UTF-8 encoding. If the metadata is in a non-Latin script such as Chinese, a version transliterated or transcribed to Latin characters should be provided as well.
* In addition to the metadata, the data provider must provide documentation needed for successful loading of the records, such as descriptions of the structure, syntax and semantics of the metadata records.

### Harvesting Channels
Harvesting is the process of automatically fetching remote metadata. While OAI-PMH still is the de facto standard for metadata harvesting, other channels become more important. B2FIND supports several methods, as described below. Once one of these transfer methods have been successfully implemented, B2FIND first takes up a few test samples to analyse their content. As soon as the harvesting and mapping has been consolidated and the data provider gives their consent, the metadata are published on the B2FIND discovery portal, and an operational and stable ingestion process is established. 

#### OAI-PMH
OAI-PMH [Open Archive Initiative - Protocol for Metadata Harvesting](https://www.openarchives.org/pmh/) is B2FIND’s preferred metadata harvesting protocol. It can be used to fetch metadata directly from the data providers within research communities. The simplicity of the protocol allows a controlled and easy-to-manage transfer of metadata and it also allows to fetch update information from a defined periode. Very little information must be provided to enable B2FIND to perform the harvesting process using this protocol:

* OAI endpoint: This is the URL of the OAI provider server on data provider site, which must be open for OAI-PMH read requests
* OAI mdprefix: This is the OAI acronym for the metadata schema in which the provided XML records are coded in (default is DublinCore, Datacite is supported)
* OAI sets (optional): It is recommended to group your records in subsets, because this simplifies the controlled harvesting

#### JSON-API
Some data providers offer their metadata encoded as JSON records, which can be retrieved, queried and browsed via a REST API. The API is generally RESTful and returns results in JSON, as the API follows the JSONAPI specification.

#### CSW
Catalog Service for the Web (CSW) is a standard for exposing a catalogue of geospatial records in XML on the Internet (over HTTP). The catalogue is made up of records that describe geospatial data and services. B2FIND uses a CSW implementation to harvest XML records from so-called GeoNetwork portals. 

#### REST API
Communities or data provider that do not expose their metadata via the channels mentioned above may be integrated in B2FIND as long as they offer any REST API. However, developing a new harvesting method requires resources and effort, thus the integration process will take time. 


### Supported Metadata Standards for Mapping
B2FIND supports several generic as well as thematic metadata standards, such as:

* Datacite
* DublinCore
* OpenAire
* ISO 10115/19139 (INSPIRE)
* DDI 2.5

Community specific metadata schemas are supported as well, while the concrete mapping is done in close cooperation with the communities and/or data provider. B2FIND continously develops new 'reader' for the ingestion of records with other metadata schemas or standards, such as DCAT or CERIF. However, this requires resources and effort and will take time. 

As B2FIND follows a low-barrier approach, only six metadata elements are mandatory:

1. the name of the research `Community` or data provider B2FIND harvests from. This ensures the visibility of the data providers and research infrastructures. 
2. the `Title` of the data set, i.e. a unique and unambiguous name or heading by which the referred resource is known 
3. at least one `Identifier`, which has two roles: to identify the described resource, and to facilitate a persistent link to the research data set itself, which should be available on the web. If the identifier is not persistent (actionable/resolvable), an HTTP URI of the described resource must be provided as well. The URI should be as persistent as reasonably achievable.
4. the research `Discipline(s)` the metadata adhere to, chosen from B2FIND internal [vocabulary](https://github.com/EUDAT-B2FIND/md-ingestion/blob/master/etc/b2find_disciplines.yaml). This list is under constant revision, so missing disciplines can be added.
5. a `Publisher` and 
6. a `PublicationYear`


## EUDAT Core Metadata Schema
The EUDAT Core Metadata Schema defines and describes metadata for research output in order to transfer metadata information through different EUDAT CDI services. It originated from the need to define a common schema that allows to harmonise metadata elements used for storage, publication and discovery of digital research objects across EUDAT partners and beyond. You can access the EUDAT Core Metadata Schema XSD file [here](https://gitlab.eudat.eu/eudat-metadata/eudat-core-schema/-/blob/master/eudat-core.xsd) on GitLab.

B2FIND uses the EUDAT Core Metadata Schema for its ingestion process. This generic metadata schema is based on Datacite with some additional elements:

* `Temporal Coverage` which relates to the temporal coverage of the data
* `Discipline` which adheres to the scientific discipline(s) the data can be categorized in
* `Instrument` which allows to describe instruments that are used for producing the data
* `Contact` which is always useful

A documentation of the EUDAT Core Metadata Schema can be found [here](https://eudat-b2find.github.io/schema-doc/introduction.html). 

Even though the EUDAT Core Metadata Schema was developed for streamlining metadata transfer across EUDAT services, of course it may be used by everyone to exchange metadata. For that, we strongly recommend using standardised vocabularies wherever possible. However, in order to make as much research output as possible searchable and findable, only few elements are mandatory and only few elements require specific attributes.

Please note that the EUDAT Core Metadata Schema is maintained by the EUDAT Metadata Working Group, which means it may be subject of changes in further development. 


## How to be integrated?
All (meta)data provider must agree with the licensing principles described above. Apart from that we need

* a harvesting endpoint (where and how do you expose your metadata? Using a standardised protocol like OAI-PMH or CSW? Or via RestAPI? If RestAPI, please specify the metadata retrieval commands)
* a metadata schema (a generic standard like DublinCore, Datacite or OpenAire? Or thematic like ISO19115/19139 or DDI? Or your own? If so, please specify where we can retrieve the `Identifier`)
* Ideally you use our [template](https://b2drop.eudat.eu/s/KZJXroDeB24HEgi/download) for metadata integration in B2FIND. 

As soon as we have sufficient information we will do a testingestion on one of our testmachines, (if needed) discuss the results and (if needed) improve the mapping. After all issues are solved we will do the metadata ingestion on the productive B2FIND and document the integration process. 

If you want to join B2FIND as a data provider, please use the [EUDAT Request Tracker](https://eudat.eu/contact-support-request) or contact the B2FIND team directly via email: b2find@dkrz.de.  
