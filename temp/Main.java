import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner inp = new Scanner(System.in);
        
        int n = inp.nextInt();
        Stack<Integer> st = new Stack<>();
        
        for (int i = 0; i < n; i++) {
            int val = inp.nextInt();
            st.push(val);
        }
        
        System.out.println("Stack elements (LIFO order):");
        while (!st.isEmpty()) {
            System.out.print(st.pop() + " ");
        }
    }
}
