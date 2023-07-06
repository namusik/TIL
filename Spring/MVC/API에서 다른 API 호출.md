# API 에서 다른 API 호출

Controller에서 로직을 진행한 후, 
다른/같은 Controller의 API를 호출해야 할 때가 있다. 

이때는 return 값을 redirect로 주면 된다. 

~~~java
@PostMapping("/{itemId}/edit")
public String edit(@PathVariable Long itemId, @ModelAttribute Item item) {
    itemRepository.update(itemId, item);
    return "redirect:/basic/items/{itemId}";
}
~~~

위의 예는 상품을 수정하는 로직을 진행한후, 상세 페이지로 보내고 싶을 때이다. 

이때, 기존에 만들어둔 API를 호출하기 위해서 redirect:를 사용하면 된다. 

이때, 만약 @PathVariable를 파라미터로 받았다면, 변수를 + 해서 url에 붙여줄 필요없이 {}안에 넣어주면 된다. 

@Pathvariable이 없을 때는 RedirectAttributes를 사용하면 된다. 

~~~java
public String addItemV6(@ModelAttribute  Item item, RedirectAttributes redirectAttributes) {
    Item savedItem = itemRepository.save(item);
    redirectAttributes.addAttribute("itemId", savedItem.getId());
    redirectAttributes.addAttribute("status", true);
    return "redirect:/basic/items/{itemId}";
}
~~~
redirect에 전달하고싶은 변수가 있다면 
redirectAttributes.addAttribute를 사용해주고 변수명을 {...}안에 적어주면 된다. 

그리고, 경로 변수로 적어주지 않는 attribute는 쿼리 파라미터의 형태로 같이 날라간다. ?status=true