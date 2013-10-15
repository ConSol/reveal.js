package de.consol.research.cache;

import org.infinispan.manager.DefaultCacheManager;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.concurrent.ConcurrentMap;

/**
 * @author Fabian Stäber
 */
public class Main {

    public static void main(String[] args) throws IOException {
        DefaultCacheManager cacheManager = new DefaultCacheManager(args[0]);
        ConcurrentMap<String, String> map = cacheManager.getCache();
        if (args[0].equals("infinispan1.xml")) {
            map.putIfAbsent("a", "a");
        }
        loop();
        cacheManager.stop();
    }

    private static void loop() throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        while (br.readLine() != null) ;
    }
}
