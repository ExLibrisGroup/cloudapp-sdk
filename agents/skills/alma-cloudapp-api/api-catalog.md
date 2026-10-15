# Alma REST API catalog

Snapshot retrieved: 2026-08-31.

Use the live official specification for implementation. The checksums below
record the material inspected when this reference was prepared and help detect
silent upstream changes. They are not API version guarantees.

## Areas

| Area | API page | OpenAPI specification | Paths | Operations | SHA-256 |
|---|---|---|---:|---:|---|
| Acquisitions | [Reference](https://developers.exlibrisgroup.com/alma/apis/acq/) | [YAML](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/acq.yaml) | 31 | 59 | `247e1b5f2fe178da97be811027fb136576118c70c73fd56d93caf1b2f3e8bdcd` |
| Analytics | [Reference](https://developers.exlibrisgroup.com/alma/apis/analytics/) | [YAML](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/analytics.yaml) | 5 | 5 | `fa304419ada21506191bf1f63932f5cba2c1a85c05d188585dcdfec36317bcbe` |
| Bibliographic records and inventory | [Reference](https://developers.exlibrisgroup.com/alma/apis/bibs/) | [YAML](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/bibs.yaml) | 41 | 77 | `07ac26123521d61ce692b36d5d2c615f61bd38b1181fa7686e318e16d1adffab` |
| Configuration | [Reference](https://developers.exlibrisgroup.com/alma/apis/conf/) | [YAML](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/conf.yaml) | 45 | 71 | `5e812f4459e9bfe63762f377a0869415c2c1dd2f9d87f0c4cf692d18aff37dbc` |
| Courses and reading lists | [Reference](https://developers.exlibrisgroup.com/alma/apis/courses/) | [YAML](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/courses.yaml) | 13 | 29 | `849e0aa4dd48a998a13856a3729db74746314d4ee6d8184784fd0f955d4add24` |
| Electronic resources | [Reference](https://developers.exlibrisgroup.com/alma/apis/electronic/) | [YAML](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/electronic.yaml) | 8 | 15 | `76bf5d1a10d83d8065b0bc9aaef9f43908f1d3ffaae14ea461e3415ca95fde63` |
| Resource-sharing partners | [Reference](https://developers.exlibrisgroup.com/alma/apis/partners/) | [YAML](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/partners.yaml) | 5 | 9 | `d8867a728469f56668ab18fb6444fde46d199700cc454851469affd9ba0b24ae` |
| Resource Sharing Directory members | [Reference](https://developers.exlibrisgroup.com/alma/apis/rsdirectorymember/) | [YAML](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/RSDirectoryMember.yaml) | 3 | 4 | `86c4249b116ef0fe1decc8697be76a1a7cc99d5ac10096a6526778c41a62021d` |
| Task lists | [Reference](https://developers.exlibrisgroup.com/alma/apis/tasklists/) | [YAML](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/tasklists.yaml) | 9 | 14 | `b4d8086cb7f57e85f841c936d5a7b98d39fa86dc58246d1646d5077c9419d7cb` |
| Users and fulfillment | [Reference](https://developers.exlibrisgroup.com/alma/apis/users/) | [YAML](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/users.yaml) | 22 | 42 | `09163791d08eb8c6156c0630d1e48217ca063e8bb283f0b18e6b234a75fd07c2` |

The main [Alma REST API documentation](https://developers.exlibrisgroup.com/alma/apis/)
also explains external API keys, regional gateways, common errors, API
versioning, and the API console. Cloud App code must not copy API-key or
gateway-host instructions from that external-application workflow.

## Snapshot observations

- The ten specifications contain 182 paths and 325 operations.
- They declare `GET`, `POST`, `PUT`, and `DELETE`; none declares `PATCH` in this
  snapshot.
- Operation descriptions and schemas are more precise than tutorial examples,
  but exact logged-in Alma user roles are generally absent.
- Schemas may be external JSON or XML Schema Definition (XSD) references.
- Analytics is XML-oriented even though it has a published OpenAPI file.
- The same HTTP method can represent creation, replacement, workflow action,
  cancellation, or localization. Read operation descriptions.

## Refresh procedure

When an operation matters to implementation or release:

1. Fetch the live area specification.
2. Locate the exact method and path.
3. Compare its current checksum or operation content with this snapshot.
4. Prefer the live operation if it changed.
5. Record meaningful drift in the relevant area reference.
6. Validate runtime behavior when the change affects permissions, Alma scope,
   or state mutation.

Do not regenerate application code automatically from an updated specification
unless the target project already uses an approved code-generation workflow.

## Links

- [https://developers.exlibrisgroup.com/alma/apis/](https://developers.exlibrisgroup.com/alma/apis/)
- [https://developers.exlibrisgroup.com/alma/apis/acq/](https://developers.exlibrisgroup.com/alma/apis/acq/)
- [https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/acq.yaml](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/acq.yaml)
- [https://developers.exlibrisgroup.com/alma/apis/analytics/](https://developers.exlibrisgroup.com/alma/apis/analytics/)
- [https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/analytics.yaml](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/analytics.yaml)
- [https://developers.exlibrisgroup.com/alma/apis/bibs/](https://developers.exlibrisgroup.com/alma/apis/bibs/)
- [https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/bibs.yaml](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/bibs.yaml)
- [https://developers.exlibrisgroup.com/alma/apis/conf/](https://developers.exlibrisgroup.com/alma/apis/conf/)
- [https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/conf.yaml](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/conf.yaml)
- [https://developers.exlibrisgroup.com/alma/apis/courses/](https://developers.exlibrisgroup.com/alma/apis/courses/)
- [https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/courses.yaml](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/courses.yaml)
- [https://developers.exlibrisgroup.com/alma/apis/electronic/](https://developers.exlibrisgroup.com/alma/apis/electronic/)
- [https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/electronic.yaml](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/electronic.yaml)
- [https://developers.exlibrisgroup.com/alma/apis/partners/](https://developers.exlibrisgroup.com/alma/apis/partners/)
- [https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/partners.yaml](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/partners.yaml)
- [https://developers.exlibrisgroup.com/alma/apis/rsdirectorymember/](https://developers.exlibrisgroup.com/alma/apis/rsdirectorymember/)
- [https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/RSDirectoryMember.yaml](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/RSDirectoryMember.yaml)
- [https://developers.exlibrisgroup.com/alma/apis/tasklists/](https://developers.exlibrisgroup.com/alma/apis/tasklists/)
- [https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/tasklists.yaml](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/tasklists.yaml)
- [https://developers.exlibrisgroup.com/alma/apis/users/](https://developers.exlibrisgroup.com/alma/apis/users/)
- [https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/users.yaml](https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/users.yaml)
