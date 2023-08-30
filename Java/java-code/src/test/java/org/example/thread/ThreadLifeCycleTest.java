package org.example.thread;

import org.junit.jupiter.api.Test;

public class ThreadLifeCycleTest {
    @Test
    void lifeCycle() {
        Runnable runnable = () -> System.out.println("thread start");
        var thread = new Thread(runnable);
        System.out.println("thread.getState() = " + thread.getState());

        thread.start();
        System.out.println("thread.getState() = " + thread.getState());
    }

    @Test
    void blocked() throws InterruptedException {
        var t1 = new Thread(new DemoBlockRunnable());
        var t2 = new Thread(new DemoBlockRunnable());

        t1.start();
        t2.start();

        Thread.sleep(1000);

        System.out.println(t2.getState());
        System.exit(0);

    }

    class DemoBlockRunnable implements Runnable {

        @Override
        public void run() {
            commonResource();
        }

        public static synchronized void commonResource() {
            while (true) {

            }
        }
    }


}
