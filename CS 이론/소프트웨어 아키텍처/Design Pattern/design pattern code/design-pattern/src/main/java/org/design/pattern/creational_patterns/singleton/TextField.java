package org.design.pattern.creational_patterns.singleton;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public class TextField {
    private String text;

    public void display() {
        String themeColor = Theme.getInstance().getThemeColor();
        System.out.println(themeColor + "-" + text);
    }

}
