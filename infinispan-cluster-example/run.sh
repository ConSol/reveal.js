#!/bin/bash

# See http://docs.oracle.com/javase/6/docs/technotes/guides/management/agent.html

cd target

CLASSPATH="infinispan-cluster-example-0.1.jar"

while read jar
do
    CLASSPATH="$CLASSPATH:$jar"
done < <(ls dependency/*.jar)

echo $CLASSPATH

java -javaagent:../jolokia-jvm-1.1.3-agent.jar=port=800$1 -cp "$CLASSPATH" de.consol.research.cache.Main infinispan$1.xml
