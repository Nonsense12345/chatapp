#include <iostream>
#include <vector>
#include <cmath>

using namespace std;

// Function to check if a number is prime
bool isPrime(int n) {
    if (n < 2) {
        return false;
    }
    for (int i = 2; i <= sqrt(n); i++) {
        if (n % i == 0) {
            return false;
        }
    }
    return true;
}

// Function to check if a number is special
bool isSpecial(int n) {
    int sum = 0;
    while (n > 0) {
        sum += n % 10;
        n /= 10;
    }
    return isPrime(sum);
}

int main() {
   

    
        long long n;
        cin >> n;

        int count = 0;
        for (int x = 1; x <= n; x++) {
            int y = (n - x) / 2;
            if (x + 2 * y == n && isSpecial(x) && isSpecial(y)) {
                count++;
            }
        }

        cout << count << endl;
    

    return 0;
}

