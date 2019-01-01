## CQRS ES (Command Query Responsibility Segregation with Event Sourcing)
This is an empty project at the moment and is being used as a place holder for the future commit... move along, nothing to see here.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Here are the items that you will need to get this running initially:

```
node.js version 10+
```

####RabbitMQ

One of the supported brokers for the messages is via RabbitMQ and here is a quick reference to run a local instance in Docker for development purposes.

You can then go to http://localhost:8080 or http://host-ip:8080 in a browser:
username: guest
password: guest

more information is located at: https://hub.docker.com/_/rabbitmq/

```
docker run -d --hostname rabbitmq01 --name rabbitmq01 -p 8080:15672 rabbitmq:3-management
```

## Running the tests

Tests will be available when the code is written

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## Authors

* **Brandon Hedge** - *Initial work*


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Greg Young for various training materials and conversations
