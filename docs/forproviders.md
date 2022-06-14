# For Providers

## Guidelines
Welcome to the guidelines of EUDAT’s metadata service B2FIND for data providers. B2FIND gathers diverse metadata on the research output of many heterogeneous sources with the aim of providing a unified discovery portal. The portal then allows widespread and cross-disciplinary search and access to the underlying data collections. These guidelines are intended to provide information about the requirements for successful metadata integration into B2FIND.

### Open Research Data Principles
EUDAT propagates 'good practices' for research data management which follow the FAIR principles. These are a set of guidelines widely used for managing scientific data so that it can be accessed and re-used efficiently, see Guidelines on FAIR Data Management in Horizon 2020 . The FAIR principles promote:

    the availability of data supporting scholarly publications
    the use of data repositories
    the value of data curation to enable data access and reuse
    support for developing researchers’ data management skills
    and establishing cultural norms of academia that ensure that individuals gain credit for sharing data.

We address these principles to the extent that they affect metadata in the following sections. In general, we follow a low-barrier approach that aims to facilitate an easy metadata integration into the B2FIND portal.

writing them new... and link to the readthedocs thing

## Metadata Schema
explaining what we have, where it is
- crosswalks
- mapping concordance
- request for changes

## How to be integrated?
The data provider must agree with the licensing principles of EUDAT-B2FIND (see the Terms of Use for EUDAT-Services) and DKRZ (see the Legal Notice of DKRZ).
- In particular, the provider must consent to the provided metadata being made publicly available and openly accessible under CC-BY International v.4.0 subsequent without any restrictions on reuse in original and derivative forms. Note: This open access licence only applies to the metadata records published and visible in the B2FIND portal, not to the underlying data collections referred to and described by the B2FIND datasets.
- The data provider agrees to the metadata being made available for free in B2FIND and also for it to be harvested by and re-distributed to other metadata aggregators. No confidential metadata should be provided (although the described research data sets themselves may have access limitations). Copyright-protected metadata can only be published if there is a licence agreement between the data provider and EUDAT that meets the B2FIND requirements.
- An interface to retrieve metadata must be available, accessible and usable (see Harvesting Metadata for more information about such interfaces).
The Metadata provided should be stable and 'good enough'. This is described in more detail in the Metadata Quality section and will be determined with each data provider individually if and when necessary. Some of the central issues include:
    Metadata records should be as complete as possible.
    Metadata shall not be encrypted or obfuscated.
    Metadata must use Unicode with UTF-8 encoding. If the metadata is in a non-Latin script such as Chinese, a version transliterated or transcribed to Latin characters should be provided as well.
    In addition to the metadata, the data provider must provide documentation needed for successful loading of the records, such as descriptions of the structure, syntax and semantics of the metadata records (see section Metadata Encodings and Schemas).

Six metadata elements are mandatory:
1. the name of the research <Community> or data provider B2FIND harvests from. This ensures the visibility of the data providers and research infrastructures.
2. the <Title> of the data set, i.e. a unique and unambiguous name or heading by which the referred resource is known (avoid referencing two different data collections by same title).
3. at least one <Identifier>, which has two roles: to identify the described resource, and to facilitate a persistent link to the research data set itself, which should be available on the web. If the identifier is not persistent (actionable/resolvable), an HTTP URI of the described resource must be provided as well. The URI should be as persistent as reasonably achievable.
4. the research <Discipline(s)> the metadata adhere to (chosen from b2find_disciplines.yml). This list is under constant revision, so missing disciplines can be added.
5. <Publisher> and 
6. <PublicationYear>


## Training
link training materials if it exists
